import { Text } from "@modules/common/components/ui"

/**
 * 08_CUSTOMER_ACCOUNT_SPECIFICATION.md §16 — "specifies that a preference
 * exists and is respected, not the channel(s) it applies to... once the
 * notification-channel decision is made." Email and WhatsApp are the
 * approved channels (`DECISION_LOG.md`), but the notification *provider
 * module* that would actually send anything through either channel is not
 * yet built (`TIER_B_...NOTIFICATION...MODULE.md` remains Draft) — so
 * there is nothing real for a channel toggle to control yet. Building a
 * preference UI with no backend behind it would be worse than none at
 * all: it would look functional while silently doing nothing. This states
 * the current, honest state instead, per §16's own default: "essential/
 * transactional notifications only," restated here rather than invented
 * as a working toggle.
 */
export default function NotificationPreferences() {
  return (
    <div className="w-full" data-testid="notification-preferences-page">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Notification preferences</h1>
      </div>
      <Text className="text-ui-fg-base">
        Notification channels (email, WhatsApp) are approved but not yet
        connected — there&apos;s nothing to configure here yet. Once they are,
        you&apos;ll be able to choose how you hear about your orders here.
        Until then, you&apos;ll only ever receive the essential, order-related
        updates this platform is built to send.
      </Text>
    </div>
  )
}
