import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateRoom, useJoinRoom } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { saveRoomSession, getRoomSession } from "@/lib/session";
import { KeyRound, ShieldAlert } from "lucide-react";

const createFormSchema = z.object({
  lifetimeMinutes: z.coerce.number().min(1).max(120).default(5),
});

const joinFormSchema = z.object({
  code: z.string().length(6, "Code must be exactly 6 digits"),
  name: z.string().max(40).optional(),
});

export default function Home() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [expiredCode, setExpiredCode] = useState<string | null>(null);

  const createRoom = useCreateRoom();
  const joinRoom = useJoinRoom();

  const createForm = useForm<z.infer<typeof createFormSchema>>({
    resolver: zodResolver(createFormSchema),
    defaultValues: { lifetimeMinutes: 5 },
  });

  const joinForm = useForm<z.infer<typeof joinFormSchema>>({
    resolver: zodResolver(joinFormSchema),
    defaultValues: { code: "", name: "" },
  });

  // Attempt to autofill code from query parameter if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get("code");
    if (codeParam && codeParam.length === 6) {
      joinForm.setValue("code", codeParam);
    }
    const expiredParam = params.get("expired");
    if (expiredParam) {
      setExpiredCode(expiredParam);
    }
  }, [joinForm]);

  function onCreateSubmit(values: z.infer<typeof createFormSchema>) {
    createRoom.mutate(
      { data: { lifetimeMinutes: values.lifetimeMinutes } },
      {
        onSuccess: (session) => {
          saveRoomSession(session.code, session);
          setLocation(`/room/${session.code}`);
        },
        onError: (err) => {
          toast({
            variant: "destructive",
            title: "Failed to create room",
            description: (err as any).data?.error || "An unexpected error occurred.",
          });
        },
      }
    );
  }

  function onJoinSubmit(values: z.infer<typeof joinFormSchema>) {
    joinRoom.mutate(
      { code: values.code, data: { name: values.name } },
      {
        onSuccess: (session) => {
          saveRoomSession(session.code, session);
          setLocation(`/room/${session.code}`);
        },
        onError: (err) => {
          toast({
            variant: "destructive",
            title: "Failed to join room",
            description: (err as any).data?.error || "Room not found or expired.",
          });
        },
      }
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 md:p-8 bg-background relative overflow-hidden">
      {/* Decorative background blob */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="z-10 w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Secret Share</h1>
          <p className="text-muted-foreground">
            Drop passwords, tokens, and API keys to the room. They self-destruct when time runs out.
          </p>
        </div>

        {expiredCode && (
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Room {expiredCode} has expired</AlertTitle>
            <AlertDescription>
              Its secrets were destroyed and cannot be recovered. Ask the host to
              start a new room.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-border/60 shadow-lg">
          <Tabs defaultValue="join" className="w-full">
            <div className="px-6 pt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="join">Join Room</TabsTrigger>
                <TabsTrigger value="create">Host Room</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="join" className="mt-0">
              <CardHeader>
                <CardTitle>Join a Room</CardTitle>
                <CardDescription>
                  Enter the 6-digit code shared by the host.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...joinForm}>
                  <form onSubmit={joinForm.handleSubmit(onJoinSubmit)} className="space-y-6">
                    <FormField
                      control={joinForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-center">
                          <FormLabel className="self-start">Room Code</FormLabel>
                          <FormControl>
                            <InputOTP maxLength={6} {...field} className="w-full justify-center">
                              <InputOTPGroup className="gap-2">
                                <InputOTPSlot index={0} className="h-12 w-12 text-lg rounded-md border" />
                                <InputOTPSlot index={1} className="h-12 w-12 text-lg rounded-md border" />
                                <InputOTPSlot index={2} className="h-12 w-12 text-lg rounded-md border" />
                                <InputOTPSlot index={3} className="h-12 w-12 text-lg rounded-md border" />
                                <InputOTPSlot index={4} className="h-12 w-12 text-lg rounded-md border" />
                                <InputOTPSlot index={5} className="h-12 w-12 text-lg rounded-md border" />
                              </InputOTPGroup>
                            </InputOTP>
                          </FormControl>
                          <FormMessage className="self-start" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={joinForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Alex" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-medium"
                      disabled={joinRoom.isPending}
                    >
                      {joinRoom.isPending ? "Joining..." : "Join Room"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="create" className="mt-0">
              <CardHeader>
                <CardTitle>Create a Room</CardTitle>
                <CardDescription>
                  Spin up a secure, ephemeral session for sharing secrets.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
                    <FormField
                      control={createForm.control}
                      name="lifetimeMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Lifetime (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={120}
                              {...field}
                            />
                          </FormControl>
                          <CardDescription>
                            Between 1 and 120 minutes. All secrets are permanently deleted when time expires.
                          </CardDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="rounded-lg bg-primary/5 p-4 border border-primary/10 flex items-start gap-3 text-sm text-primary/90">
                      <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                      <p>
                        Keep this tab open while you're the host. Closing it will mark you as inactive, though the room remains alive until expiry.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-medium"
                      disabled={createRoom.isPending}
                    >
                      {createRoom.isPending ? "Creating..." : "Start Room"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
