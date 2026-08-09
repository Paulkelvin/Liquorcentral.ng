/**
 * Next's own server-side hook (App Router, stable since Next 15) — run
 * once when the server process starts, before it handles any request.
 * See `src/instrumentation-client.ts` for the browser-side half.
 *
 * Gated the same way Paystack and SendGrid already are on the backend:
 * registered only when its own required env var is actually present, so
 * this boots identically to before until a real Sentry DSN is supplied.
 */
export async function register() {
  if (!process.env.SENTRY_DSN) {
    return
  }

  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    const Sentry = await import("@sentry/nextjs")
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || "development",
      tracesSampleRate: 0.1,
    })
  }
}

// Captures errors from nested React Server Components that would
// otherwise only reach the browser as an opaque "digest" with no server
// stack trace attached anywhere.
export async function onRequestError(...args: unknown[]) {
  if (!process.env.SENTRY_DSN) {
    return
  }
  const Sentry = await import("@sentry/nextjs")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(Sentry.captureRequestError as (...a: any[]) => void)(...args)
}
