import { useCallback, useEffect, useState, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  useGetRoom, 
  getGetRoomQueryKey,
  useLeaveRoom, 
  useCreateSecret, 
  useUpdateSecret, 
  useDeleteSecret,
  type Room,
  type RoomSession 
} from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Countdown } from "@/components/countdown";
import { SecretCard } from "@/components/secret-card";
import { useToast } from "@/hooks/use-toast";
import { getRoomSession, clearRoomSession } from "@/lib/session";
import { useRoomStream } from "@/hooks/use-room-stream";
import { Users, LogOut, Plus, Shield, ShieldAlert, Loader2 } from "lucide-react";

const secretFormSchema = z.object({
  label: z.string().min(1, "Label is required").max(80),
  value: z.string().min(1, "Value is required").max(10000),
});

export default function RoomPage() {
  const { code } = useParams<{ code: string }>();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [session, setSession] = useState<RoomSession | null>(null);
  
  useEffect(() => {
    if (!code) return;
    const s = getRoomSession(code);
    if (!s) {
      // Redirect to join flow with code prefilled
      setLocation(`/?code=${code}`);
      return;
    }
    setSession(s);
  }, [code, setLocation]);

  const { data: room, isLoading: isLoadingRoom, isError: isRoomError } = useGetRoom(
    code || "",
    { query: { enabled: !!code && !!session, queryKey: getGetRoomQueryKey(code || "") } }
  );

  const { isConnecting, isExpired } = useRoomStream(code, session?.participantId);
  
  const leaveRoom = useLeaveRoom();
  const createSecret = useCreateSecret();
  const updateSecret = useUpdateSecret();
  const deleteSecret = useDeleteSecret();

  const [isSecretDialogOpen, setIsSecretDialogOpen] = useState(false);
  const [editingSecretId, setEditingSecretId] = useState<string | null>(null);

  const secretForm = useForm<z.infer<typeof secretFormSchema>>({
    resolver: zodResolver(secretFormSchema),
    defaultValues: { label: "", value: "" },
  });

  // Safety net: if the event stream drops, the countdown reaching zero still
  // tears the room down locally instead of stranding the user on a dead screen.
  const [hasCountedDown, setHasCountedDown] = useState(false);
  const handleCountedDown = useCallback(() => setHasCountedDown(true), []);

  useEffect(() => {
    if (isExpired || isRoomError || hasCountedDown) {
      clearRoomSession(code!);
      toast({
        title: "Room Expired",
        description: "The room and all its secrets have been securely destroyed.",
        variant: "destructive",
      });
      setLocation(`/?expired=${code}`);
    }
  }, [isExpired, isRoomError, hasCountedDown, code, setLocation, toast]);

  const handleLeave = () => {
    if (session) {
      leaveRoom.mutate({ code: session.code, participantId: session.participantId });
      clearRoomSession(session.code);
    }
    setLocation("/");
  };

  const openAddDialog = () => {
    setEditingSecretId(null);
    secretForm.reset({ label: "", value: "" });
    setIsSecretDialogOpen(true);
  };

  const openEditDialog = (secretId: string, label: string, value: string) => {
    setEditingSecretId(secretId);
    secretForm.reset({ label, value });
    setIsSecretDialogOpen(true);
  };

  const onSecretSubmit = (values: z.infer<typeof secretFormSchema>) => {
    if (!session || !session.hostToken) return;

    if (editingSecretId) {
      updateSecret.mutate(
        {
          code: session.code,
          secretId: editingSecretId,
          data: { hostToken: session.hostToken, label: values.label, value: values.value },
        },
        {
          onSuccess: () => {
            setIsSecretDialogOpen(false);
            toast({ title: "Secret updated" });
          },
          onError: (err) => {
            toast({ title: "Failed to update secret", description: (err as any).data?.error, variant: "destructive" });
          },
        }
      );
    } else {
      createSecret.mutate(
        {
          code: session.code,
          data: { hostToken: session.hostToken, label: values.label, value: values.value },
        },
        {
          onSuccess: () => {
            setIsSecretDialogOpen(false);
            toast({ title: "Secret added" });
          },
          onError: (err) => {
            toast({ title: "Failed to add secret", description: (err as any).data?.error, variant: "destructive" });
          },
        }
      );
    }
  };

  const handleDeleteSecret = (secretId: string) => {
    if (!session || !session.hostToken) return;
    if (!confirm("Are you sure you want to delete this secret?")) return;
    
    deleteSecret.mutate(
      {
        code: session.code,
        secretId,
        data: { hostToken: session.hostToken },
      },
      {
        onSuccess: () => toast({ title: "Secret deleted" }),
        onError: (err) => toast({ title: "Failed to delete secret", description: (err as any).data?.error, variant: "destructive" }),
      }
    );
  };

  if (!session || isLoadingRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!room) return null;

  const isHost = session.role === "host";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold hidden sm:inline">Secret Share</span>
            </div>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div className="font-mono text-lg font-bold tracking-widest bg-muted px-3 py-1 rounded-md">
              {room.code}
            </div>
            {isConnecting && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground" title="Connected participants">
              <Users className="w-4 h-4" />
              <span className="font-medium tabular-nums">{room.participantCount}</span>
            </div>
            <Countdown expiresAt={room.expiresAt} onExpire={handleCountedDown} />
            <Button variant="ghost" size="sm" onClick={handleLeave} className="text-muted-foreground hover:text-destructive">
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Leave</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Shared Secrets</h2>
            <p className="text-sm text-muted-foreground">
              These will vanish completely when the room expires.
            </p>
          </div>
          {isHost && (
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Secret
            </Button>
          )}
        </div>

        {room.secrets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed bg-card/50 mt-8">
            <ShieldAlert className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No secrets yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {isHost 
                ? "Add credentials, API keys, or temporary passwords for the room to see."
                : "Waiting for the host to drop credentials."}
            </p>
            {isHost && (
              <Button variant="outline" className="mt-6" onClick={openAddDialog}>
                Add your first secret
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {room.secrets.map((secret) => (
              <SecretCard
                key={secret.id}
                label={secret.label}
                value={secret.value}
                isHost={isHost}
                onEdit={() => openEditDialog(secret.id, secret.label, secret.value)}
                onDelete={() => handleDeleteSecret(secret.id)}
              />
            ))}
          </div>
        )}
      </main>

      <Dialog open={isSecretDialogOpen} onOpenChange={setIsSecretDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSecretId ? "Edit Secret" : "Add Secret"}</DialogTitle>
            <DialogDescription>
              This will be broadcast immediately to all participants in the room.
            </DialogDescription>
          </DialogHeader>
          <Form {...secretForm}>
            <form onSubmit={secretForm.handleSubmit(onSecretSubmit)} className="space-y-4">
              <FormField
                control={secretForm.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Production Database URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={secretForm.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secret Value</FormLabel>
                    <FormControl>
                      <Input placeholder="postgres://user:pass@host:5432/db" {...field} className="font-mono text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsSecretDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createSecret.isPending || updateSecret.isPending}>
                  {createSecret.isPending || updateSecret.isPending ? "Saving..." : "Save Secret"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
