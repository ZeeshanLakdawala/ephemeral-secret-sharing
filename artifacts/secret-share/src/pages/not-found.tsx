import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-background p-6">
      <div className="flex max-w-md flex-col items-center text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold tracking-tighter text-primary">404</h1>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Page not found
          </h2>
          <p className="text-muted-foreground">
            The room you are looking for does not exist or has expired.
          </p>
        </div>
        <Link href="/">
          <Button size="lg" className="w-full sm:w-auto">
            Return to home
          </Button>
        </Link>
      </div>
    </div>
  );
}
