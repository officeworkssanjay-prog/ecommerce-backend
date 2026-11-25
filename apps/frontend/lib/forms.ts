import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError, errorMessage } from "./api";

/**
 * Copies the API's per-field validation messages onto a react-hook-form instance and returns the
 * message for a form-level banner. Use in the catch block of a submit handler.
 */
export function applyServerErrors<T extends FieldValues>(err: unknown, setError: UseFormSetError<T>): string {
  if (err instanceof ApiError) {
    for (const [field, messages] of Object.entries(err.errors)) {
      setError(field as Path<T>, { type: "server", message: messages[0] });
    }
    // If every message was attached to a field, the banner can stay generic.
    return Object.keys(err.errors).length > 0 ? "Please fix the highlighted fields." : err.message;
  }
  return errorMessage(err);
}
