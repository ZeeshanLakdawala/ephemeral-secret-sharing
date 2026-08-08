import { useState } from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface SecretCardProps {
  label: string;
  value: string;
  isHost?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SecretCard({
  label,
  value,
  isHost,
  onEdit,
  onDelete,
}: SecretCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Secret value has been copied.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-foreground truncate">{label}</span>
          <div className="flex items-center gap-1">
            {isHost && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                  onClick={onEdit}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={onDelete}
                >
                  Delete
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setRevealed(!revealed)}
              title={revealed ? "Hide secret" : "Reveal secret"}
            >
              {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <div className="flex items-stretch gap-2">
          <div className="relative flex-1 overflow-hidden rounded-md border bg-muted/50 px-3 py-2">
            <div
              className={cn(
                "font-mono text-sm break-all transition-all duration-200",
                revealed ? "blur-none text-foreground" : "blur-md select-none text-muted-foreground"
              )}
            >
              {revealed ? value : "••••••••••••••••••••••••"}
            </div>
            {!revealed && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm pointer-events-none">
                <span className="text-xs font-medium text-muted-foreground">Hidden</span>
              </div>
            )}
          </div>
          <Button
            variant="secondary"
            className="shrink-0 h-auto"
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
