"use client"

import { useEffect } from "react"
import { Button, Heading, Text } from "@modules/common/components/ui"

/**
 * Error boundary infrastructure (Phase 0c — Storefront Foundation).
 * Next.js renders this automatically for any thrown error within this
 * segment (everything under [countryCode], i.e. both the (main) and
 * (checkout) route groups). No specification behavior is implemented
 * here — this is the generic fallback every future page relies on when
 * something genuinely goes wrong, not a per-page error message.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error)
  }, [error])

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-4 min-h-[60vh] px-4 text-center"
    >
      <Heading level="h2">Something went wrong</Heading>
      <Text muted className="max-w-md">
        We hit an unexpected error loading this page. This has been logged —
        please try again.
      </Text>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  )
}
