import { ReactNode } from "react"
import { Label } from "@modules/common/components/ui"

/**
 * Form foundation (Phase 0c — Storefront Foundation): the canonical
 * label + control + error composition implementing DESIGN_SYSTEM.md §B9
 * directly:
 *   - the label is always visible above the field, never placeholder-only
 *   - required fields are marked clearly
 *   - the error appears directly below the field, in plain language
 *
 * This component holds no validation logic itself (see
 * useBlurValidation) — it only guarantees every field in the storefront
 * assembles those three pieces in the same order, with the same spacing
 * and semantics, regardless of which specification's form eventually uses
 * it.
 */
export type FormFieldProps = {
  id: string
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
}

export default function FormField({
  id,
  label,
  required,
  error,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-danger" aria-hidden="true">
            {" "}
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </Label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-caption text-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-caption text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
