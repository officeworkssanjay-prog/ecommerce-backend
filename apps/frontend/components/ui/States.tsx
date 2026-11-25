import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-gold-dark", className)} aria-label="Loading" />;
}

/** Centered loading indicator for a whole section or page. */
export function PageLoader({ label = "Loading…", className }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn("flex flex-1 items-center justify-center gap-3 py-24 text-sm text-ink/60", className)}>
      <Spinner />
      {label}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-sand/70", className)} />;
}

export function EmptyState({ title, description, action, icon }: { title: string; description?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="text-gold-dark">{icon ?? <Inbox className="h-10 w-10" aria-hidden />}</div>
      <h3 className="font-serif text-xl text-ink">{title}</h3>
      {description && <p className="max-w-md text-sm text-ink/60">{description}</p>}
      {action}
    </div>
  );
}

/** Shown when a request fails. Never substitute fake data: tell the user and let them retry. */
export function ErrorState({ message, onRetry }: { message?: string | null; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <AlertTriangle className="h-10 w-10 text-danger" aria-hidden />
      <h3 className="font-serif text-xl text-ink">We couldn’t load this</h3>
      <p className="max-w-md text-sm text-ink/60">{message || "Something went wrong. Please try again."}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
