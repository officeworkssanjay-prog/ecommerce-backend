"use client";

import { ErrorState } from "@/components/ui/States";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <ErrorState message={error.message || "An unexpected error occurred."} onRetry={reset} />
    </div>
  );
}
