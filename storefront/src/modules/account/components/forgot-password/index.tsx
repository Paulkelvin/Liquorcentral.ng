"use client"

import { requestPasswordReset } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { Input } from "@modules/common/components/ui"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

/**
 * 08_CUSTOMER_ACCOUNT_SPECIFICATION.md §9 — "requesting a reset never
 * confirms or denies whether the submitted email has an account" — the
 * identical message is shown regardless of what actually happened
 * server-side (`requestPasswordReset` always returns `{ state: "sent" }`).
 */
const ForgotPassword = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(requestPasswordReset, null)

  return (
    <div className="flex w-full flex-col" data-testid="forgot-password-page">
      <h1 className="mb-4 text-center font-display text-heading-3 font-semibold tracking-tight text-text-primary">
        Reset your password
      </h1>
      {message?.state === "sent" ? (
        <div
          className="w-full mb-6 text-center text-body text-text-primary bg-surface border border-border rounded-rounded p-4"
          data-testid="password-reset-sent-message"
          role="status"
          aria-live="polite"
        >
          If an account exists for that email address, a password reset link
          has been sent to it.
        </div>
      ) : (
        <>
          <p className="text-center text-body text-text-primary mb-8">
            Enter the email address you sign in with — we&apos;ll send a link
            to reset your password.
          </p>
          <form className="w-full" action={formAction}>
            <Input
              label="Email"
              name="email"
              placeholder="name@example.com"
              type="email"
              title="Enter a valid email address."
              autoComplete="email"
              required
              data-testid="forgot-password-email-input"
            />
            <SubmitButton
              data-testid="request-password-reset-button"
              className="w-full mt-6"
            >
              Send reset link
            </SubmitButton>
          </form>
        </>
      )}
      <span className="text-center text-text-primary text-caption mt-6">
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
          data-testid="back-to-sign-in-button"
        >
          Back to sign in
        </button>
      </span>
    </div>
  )
}

export default ForgotPassword
