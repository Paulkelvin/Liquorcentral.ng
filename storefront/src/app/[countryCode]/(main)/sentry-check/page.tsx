"use client"

import { useState } from "react"
import { Button, Heading, Text } from "@modules/common/components/ui"

/**
 * A verification page, not a customer-facing feature — exists purely to
 * answer "is Sentry actually receiving anything?" without needing to
 * find a real bug first. Same idea as the `/sentry-example-page` the
 * Sentry setup wizard would have scaffolded automatically; this is that,
 * built by hand since the wizard step was skipped in favour of the
 * env-var-gated wiring already in `instrumentation.ts` /
 * `instrumentation-client.ts`.
 *
 * Deliberately not deep-linked from any nav or footer — reachable only
 * by typing the URL, so it never shows up as a real page to a customer.
 * Safe to leave in place; it does nothing unless someone visits it and
 * presses the button, and it throws nothing if Sentry isn't configured.
 */
export default function SentryCheckPage() {
  const [triggered, setTriggered] = useState(false)

  return (
    <div className="ds-container flex flex-col items-start gap-4 py-16">
      <Heading level="h1">Sentry check</Heading>
      <Text className="max-w-md text-text-secondary">
        Press the button to throw a real error on purpose. If
        NEXT_PUBLIC_SENTRY_DSN is set, it should appear in Sentry → Issues
        within a minute. This page is not linked from anywhere on the
        site — only reachable by typing the URL.
      </Text>
      <Button
        onClick={() => {
          setTriggered(true)
          // @ts-expect-error — deliberately calling something that does
          // not exist, so this throws a real, uncaught client error.
          myUndefinedFunction()
        }}
      >
        Trigger a test error
      </Button>
      {triggered && (
        <Text className="text-caption text-text-muted">
          Error thrown. Check the browser console, then check Sentry.
        </Text>
      )}
    </div>
  )
}
