import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-md border bg-white px-3 text-sm text-ink placeholder:text-ink/40 transition-colors focus:border-gold focus:outline-none disabled:bg-parchment/50 disabled:text-ink/50";

interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

/** Label + control + error/hint, wired for screen readers. Pass the control through render props or use Input/Textarea/Select. */
function FieldShell({
  id,
  label,
  error,
  hint,
  required,
  className,
  children,
}: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-ink/70">
          {label}
          {required && <span className="text-danger" aria-hidden> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-ink/55">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const describedBy = (id: string, error?: string, hint?: string) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(function Input(
  { label, error, hint, required, className, id: idProp, ...rest },
  ref
) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <input
        ref={ref}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(control, "h-10", error ? "border-danger" : "border-sand")}
        {...rest}
      />
    </FieldShell>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps>(function Textarea(
  { label, error, hint, required, className, id: idProp, rows = 4, ...rest },
  ref
) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(control, "py-2", error ? "border-danger" : "border-sand")}
        {...rest}
      />
    </FieldShell>
  );
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldProps>(function Select(
  { label, error, hint, required, className, id: idProp, children, ...rest },
  ref
) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <select
        ref={ref}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(control, "h-10", error ? "border-danger" : "border-sand")}
        {...rest}
      >
        {children}
      </select>
    </FieldShell>
  );
});

export const Checkbox = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: ReactNode; error?: string }>(
  function Checkbox({ label, error, className, id: idProp, ...rest }, ref) {
    const auto = useId();
    const id = idProp ?? auto;
    return (
      <div className={className}>
        <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input ref={ref} id={id} type="checkbox" className="h-4 w-4 rounded border-sand accent-gold" aria-invalid={error ? true : undefined} {...rest} />
          {label}
        </label>
        {error && (
          <p role="alert" className="mt-1 text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }
);

/** Form-level error banner (use for the message returned by applyServerErrors). */
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
      {message}
    </div>
  );
}
