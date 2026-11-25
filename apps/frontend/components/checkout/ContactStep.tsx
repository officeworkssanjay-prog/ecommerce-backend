import { Button } from "@/components/ui/Button";
import type { AuthUser } from "@/lib/types";

/** Signed-in contact details from the account (guests never reach checkout). */
export function ContactStep({ user, onContinue }: { user: AuthUser; onContinue: () => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink/70">We&apos;ll send order updates to your email.</p>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-ink/60">Name</dt>
          <dd className="text-ink">{user.name}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-ink/60">Email address</dt>
          <dd className="break-all text-ink">{user.email}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-ink/60">Mobile number</dt>
          <dd className="text-ink">{user.phone || "Not added (your delivery address has a phone number)"}</dd>
        </div>
      </dl>
      <Button size="lg" className="w-full" onClick={onContinue}>
        Continue
      </Button>
      <p className="text-xs text-ink/60">By continuing, you agree to our Terms and Privacy Policy.</p>
    </div>
  );
}
