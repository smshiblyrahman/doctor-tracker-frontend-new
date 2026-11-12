import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/lib/api";

/**
 * Maps API validation/conflict errors onto form fields. Returns true when at least
 * one field received an error, so the caller can skip a generic toast.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly string[],
): boolean {
  if (!(error instanceof ApiError)) return false;
  let applied = false;

  for (const detail of error.details ?? []) {
    const field = detail.path.replace(/^body\./, "");
    if (fields.includes(field)) {
      setError(field as Path<T>, { type: "server", message: detail.message });
      applied = true;
    }
  }
  if (!applied && error.code === "CONFLICT" && /email/i.test(error.message) && fields.includes("email")) {
    setError("email" as Path<T>, { type: "server", message: "This email is already used by another doctor" });
    applied = true;
  }
  return applied;
}
