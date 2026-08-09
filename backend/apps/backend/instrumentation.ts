/**
 * Medusa's own hook — `medusa start`/`medusa develop` look for exactly
 * this file at the project root and call its `register()` export before
 * the server starts handling requests (see `@medusajs/medusa`'s
 * `registerInstrumentation`). This replaces the default commented-out
 * OpenTelemetry scaffold Medusa ships with; `registerOtel` (from
 * `@medusajs/medusa`) is still the right call if full request/workflow/
 * query tracing is ever wanted — this is deliberately narrower: error
 * tracking and basic performance monitoring via Sentry, which is what
 * was actually missing.
 *
 * Gated the same way Paystack and SendGrid already are in
 * `medusa-config.ts`: registered only when its own required env var is
 * actually present, so this boots identically to before until a real
 * Sentry DSN is supplied — no code change needed to activate it later.
 */
export function register() {
  if (!process.env.SENTRY_DSN) {
    return
  }

  // Required at call time, not at module top-level: importing
  // `@sentry/node` unconditionally would pull in and initialize its
  // instrumentation machinery even in environments that never set a DSN.
  const Sentry = require("@sentry/node")

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    // Errors always report; a low trace sample rate keeps the
    // performance-monitoring volume sane on a paid Sentry plan without
    // turning it off outright.
    tracesSampleRate: 0.1,
  })
}
