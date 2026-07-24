"use client"

import { forwardRef, InputHTMLAttributes, useState } from "react"
import { clx, Input, Label } from "@modules/common/components/ui"
import Eye from "@modules/common/icons/eye"
import EyeOff from "@modules/common/icons/eye-off"

/**
 * The one real behavioral difference a password field needs beyond the
 * shared `Input` (DESIGN_SYSTEM.md §B9's visible-label-above pattern) — a
 * show/hide toggle, carried over from the vendored floating-label Input
 * this replaces. Kept as a small dedicated client wrapper, not merged into
 * `ui/index.tsx` itself, since that file has no other interactive state
 * and stays importable from Server Components as-is.
 */
type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string
  error?: string
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const [visible, setVisible] = useState(false)

    return (
      <div className="flex flex-col gap-1">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input
            ref={ref}
            id={id}
            type={visible ? "text" : "password"}
            aria-invalid={!!error}
            aria-describedby={error && id ? `${id}-error` : undefined}
            className={clx("pr-11", className)}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            {visible ? <Eye /> : <EyeOff />}
          </button>
        </div>
        {error && (
          <p id={id ? `${id}-error` : undefined} role="alert" className="text-caption text-danger">
            {error}
          </p>
        )}
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"
