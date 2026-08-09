"use client"

import { useEffect } from "react"
import "styles/globals.css"

/**
 * Root-level error boundary (Phase 0c — Storefront Foundation). Next.js
 * only renders this in place of the entire root layout when an error
 * escapes every nested error.tsx boundary (e.g. a failure in the root
 * layout itself) — genuinely rare, but required so that case never
 * renders a blank white screen. Because it replaces the root layout
 * entirely, it must define its own <html>/<body> and re-import the
 * global stylesheet.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // This copy has said "This has been logged" since Phase 0c; nothing
    // ever actually logged it anywhere until Sentry was wired in.
    // `captureException` is a safe no-op if Sentry was never initialized
    // (no DSN configured) — see src/instrumentation-client.ts.
    import("@sentry/nextjs").then(({ captureException }) =>
      captureException(error)
    )
  }, [error])

  return (
    <html lang="en">
      <body className="bg-surface text-text-primary font-sans">
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-4 min-h-screen px-4 text-center"
        >
          <h1 className="text-heading-2 font-bold">Something went wrong</h1>
          <p className="text-text-secondary max-w-md">
            We hit an unexpected error. This has been logged — please try
            again.
          </p>
          <button
            onClick={() => reset()}
            className="min-h-[44px] px-4 rounded-radius-md bg-primary text-surface-elevated font-medium hover:bg-primary-hover"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
