import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { Input } from "@modules/common/components/ui"
import { PasswordInput } from "@modules/common/components/ui/password-input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

  return (
    <div className="flex w-full flex-col" data-testid="login-page">
      <h1 className="mb-2 text-center font-display text-heading-3 font-semibold tracking-tight text-text-primary">
        Welcome back
      </h1>
      <p className="mx-auto mb-7 max-w-[34ch] text-center text-caption text-text-muted">
        Sign in to access an enhanced shopping experience.
      </p>

      {message?.state === "verification_required" && (
        <div
          className="mb-6 rounded-radius-md border border-border bg-surface p-4 text-center text-caption text-text-primary"
          data-testid="login-verification-message"
        >
          We sent a verification link to <strong>{message.email}</strong>.
          Please verify your email, then sign in.
        </div>
      )}

      <form className="w-full" action={formAction}>
        <div className="flex w-full flex-col gap-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="name@example.com"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <PasswordInput
            label="Password"
            name="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>

        {/* 08_CUSTOMER_ACCOUNT_SPECIFICATION.md §9 — "visible directly on
            the login step, not buried." */}
        <div className="mt-2 text-right">
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.FORGOT_PASSWORD)}
            className="rounded-radius-sm text-caption text-text-muted transition-colors duration-standard ease-in-out hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            data-testid="forgot-password-button"
          >
            Forgot password?
          </button>
        </div>

        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="login-error-message"
        />

        <SubmitButton
          data-testid="sign-in-button"
          size="large"
          className="mt-6 w-full"
        >
          Sign in
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-caption text-text-muted">
        Not a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="rounded-radius-sm font-semibold text-interactive transition-colors duration-standard ease-in-out hover:text-interactive-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          data-testid="register-button"
        >
          Join us
        </button>
      </p>
    </div>
  )
}

export default Login
