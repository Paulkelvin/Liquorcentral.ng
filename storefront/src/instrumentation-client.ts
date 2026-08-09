/**
 * Next's browser-side counterpart to `src/instrumentation.ts` (this
 * exact filename, at this exact path, is what Next 15.3+ auto-loads on
 * the client — no manual `<script>`/import anywhere else needed).
 *
 * Client-side needs a `NEXT_PUBLIC_` var since it's bundled into code
 * that ships to the browser; the server half uses the private
 * `SENTRY_DSN` instead. Both are gated the same way — inert until a real
 * DSN is supplied.
 */
import * as Sentry from "@sentry/nextjs"

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 0.1,
  })
}
