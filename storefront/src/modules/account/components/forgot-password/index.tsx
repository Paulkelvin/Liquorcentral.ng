"use client"

import { requestPasswordReset } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
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
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="forgot-password-page"
    >
      <h1 className="text-large-semi uppercase mb-6">Reset your password</h1>
      {message?.state === "sent" ? (
        <div
          className="w-full mb-6 text-center text-base-regular text-ui-fg-base bg-ui-bg-subtle border border-ui-border-base rounded-rounded p-4"
          data-testid="password-reset-sent-message"
          role="status"
          aria-live="polite"
        >
          If an account exists for that email address, a password reset link
          has been sent to it.
        </div>
      ) : (
        <>
          <p className="text-center text-base-regular text-ui-fg-base mb-8">
            Enter the email address you sign in with — we&apos;ll send a link
            to reset your password.
          </p>
          <form className="w-full" action={formAction}>
            <Input
              label="Email"
              name="email"
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
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
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
