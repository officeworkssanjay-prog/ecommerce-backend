import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/Field";

/** Shared frame for one settings section: heading, description, form body and save button. */
export function SettingsCard({
  title,
  description,
  onSubmit,
  saving,
  error,
  children,
  saveLabel = "Save changes",
}: {
  title: string;
  description?: ReactNode;
  onSubmit: () => void;
  saving: boolean;
  error?: string | null;
  children: ReactNode;
  saveLabel?: string;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      noValidate
      aria-label={title}
      className="rounded-lg border border-sand bg-white p-5"
    >
      <h2 className="font-serif text-lg text-ink">{title}</h2>
      {description && <div className="mt-1 text-sm text-ink/60">{description}</div>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {error && (
          <div className="sm:col-span-2">
            <FormError message={error} />
          </div>
        )}
        {children}
      </div>
      <div className="mt-5">
        <Button type="submit" loading={saving}>
          {saveLabel}
        </Button>
      </div>
    </form>
  );
}
