"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@modules/common/components/ui"
import { completePasswordReset } from "@lib/data/customer"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * 08_CUSTOMER_ACCOUNT_SPECIFICATION.md §9 — "the reset link is time-limited
 * and single-use" (enforced natively by Medusa Auth's own token) and "a
 * successful reset shows an explicit success confirmation with a clear
 * next step" — mirrors verify-account's own verifying/success/error
 * pattern for consistency.
 */
const ResetPassword = () => {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [state, setState] = useState<"form" | "success" | "error">(
    token ? "form" : "error"
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm_password") as string

    if (password !== confirmPassword) {
      setError("Password and confirmation do not match.")
      return
    }

    setIsPending(true)
    const result = await completePasswordReset(token as string, password)
    setIsPending(false)

    if (result.success) {
      setState("success")
    } else {
      setError(
        "This reset link is invalid or has expired. Request a new one from the sign-in page."
      )
    }
  }

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center text-center gap-y-4"
      data-testid="reset-password-page"
    >
      <h1 className="text-large-semi uppercase">Set a new password</h1>

      {state === "form" && (
        <form
          className="w-full flex flex-col gap-y-2"
          action={handleSubmit}
        >
          <Input
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            data-testid="new-password-input"
          />
          <Input
            label="Confirm password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            required
            data-testid="confirm-password-input"
          />
          {error && (
            <div
              className="text-rose-500 text-small-regular py-2"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}
          <Button
            type="submit"
            variant="primary"
            className="w-full mt-4"
            isLoading={isPending}
            data-testid="reset-password-submit-button"
          >
            Reset password
          </Button>
        </form>
      )}

      {state === "success" && (
        <>
          <p
            className="text-base-regular text-ui-fg-base"
            role="status"
            aria-live="polite"
          >
            Your password has been reset. You can now sign in with your new
            password.
          </p>
          <LocalizedClientLink href="/account">
            <Button variant="primary">Go to sign in</Button>
          </LocalizedClientLink>
        </>
      )}

      {state === "error" && (
        <>
          <p
            className="text-base-regular text-ui-fg-base"
            role="alert"
            aria-live="assertive"
          >
            This reset link is invalid or has expired. Request a new one from
            the sign-in page.
          </p>
          <LocalizedClientLink href="/account">
            <Button variant="secondary">Go to sign in</Button>
          </LocalizedClientLink>
        </>
      )}
    </div>
  )
}

export default ResetPassword
