"use client";

import { useCallback } from "react";
import { ApiError, api, errorMessage } from "@/lib/api";
import { useFeedback } from "@/components/ui/Feedback";

/** Message for a failed delete: 409 "in use" responses get a hint to disable instead. */
export function deleteErrorMessage(err: unknown): string {
  const msg = errorMessage(err, "Could not delete. Please try again.");
  if (err instanceof ApiError && err.status === 409 && !/disable/i.test(msg)) return `${msg} Disable it instead of deleting.`;
  return msg;
}

/** Confirm-then-act helpers shared by the catalogue pages. `reload` refreshes the list after a write. */
export function useCrudActions(reload: () => void) {
  const { confirm, toast } = useFeedback();

  const remove = useCallback(
    async (path: string, entity: string, name: string) => {
      const ok = await confirm({
        title: `Delete ${entity.toLowerCase()}?`,
        message: `"${name}" will be permanently deleted. If it is in use you will be asked to disable it instead.`,
        confirmLabel: "Delete",
        danger: true,
      });
      if (!ok) return;
      try {
        await api.delete(path);
        toast.success(`${entity} deleted`);
        reload();
      } catch (err) {
        toast.error(deleteErrorMessage(err));
      }
    },
    [confirm, toast, reload]
  );

  /** Enables or disables a record; disabling asks for confirmation first. */
  const setStatus = useCallback(
    async (path: string, entity: string, name: string, status: boolean, field = "status") => {
      if (!status) {
        const ok = await confirm({
          title: `Disable ${entity.toLowerCase()}?`,
          message: `"${name}" will be hidden from the storefront until you enable it again.`,
          confirmLabel: "Disable",
          danger: true,
        });
        if (!ok) return;
      }
      try {
        await api.put(path, { [field]: status });
        toast.success(`${entity} ${status ? "enabled" : "disabled"}`);
        reload();
      } catch (err) {
        toast.error(errorMessage(err));
      }
    },
    [confirm, toast, reload]
  );

  return { remove, setStatus };
}
