"use client";

import { Pencil, Trash2 } from "lucide-react";
import { api, ApiError, errorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import type { useFeedback } from "@/components/ui/Feedback";

/** ISO string -> value for <input type="datetime-local"> (local time). */
export function toDateTimeInput(iso?: string | Date | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function RowActions({ name, onEdit, onDelete }: { name: string; onEdit?: () => void; onDelete?: () => void }) {
  return (
    <div className="flex justify-end gap-1">
      {onEdit && (
        <Button variant="ghost" size="sm" onClick={onEdit} aria-label={`Edit ${name}`} icon={<Pencil className="h-3.5 w-3.5" aria-hidden />}>
          Edit
        </Button>
      )}
      {onDelete && (
        <Button variant="ghost" size="sm" onClick={onDelete} aria-label={`Delete ${name}`} className="text-danger" icon={<Trash2 className="h-3.5 w-3.5" aria-hidden />}>
          Delete
        </Button>
      )}
    </div>
  );
}

type Feedback = ReturnType<typeof useFeedback>;

/** Confirm, DELETE, toast. A 409 ("in use") suggests disabling the record instead. */
export async function deleteWithConfirm(
  fb: Feedback,
  opts: { path: string; title: string; message: string; success: string; onDone: () => void }
) {
  const ok = await fb.confirm({ title: opts.title, message: opts.message, confirmLabel: "Delete", danger: true });
  if (!ok) return;
  try {
    await api.delete(opts.path);
    fb.toast.success(opts.success);
    opts.onDone();
  } catch (err) {
    fb.toast.error(err instanceof ApiError && err.status === 409 ? `${err.message} You can disable it instead of deleting it.` : errorMessage(err));
  }
}

/** PUT a partial body (e.g. { status }) and toast. */
export async function patchRecord(fb: Feedback, path: string, body: Record<string, unknown>, success: string, onDone: () => void) {
  try {
    await api.put(path, body);
    fb.toast.success(success);
    onDone();
  } catch (err) {
    fb.toast.error(errorMessage(err));
  }
}
