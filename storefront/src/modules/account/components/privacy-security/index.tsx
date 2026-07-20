"use client"

import { requestAccountLifecycleChange } from "@lib/data/customer"
import { Button, Text } from "@modules/common/components/ui"
import Input from "@modules/common/components/input"
import { HttpTypes } from "@medusajs/types"
import { useActionState, useEffect, useRef, useState } from "react"

type Props = {
  customer: HttpTypes.StoreCustomer
}

/**
 * 08_CUSTOMER_ACCOUNT_SPECIFICATION.md §17, §18 — a customer can see what
 * data the account holds (the fields already collected — §11, §12) and
 * request deletion or deactivation without contacting support. The exact
 * deletion-vs-deactivation policy (waiting periods, anonymization,
 * NDPR/retention specifics) is an explicitly open business/legal decision
 * this milestone doesn't invent (§28) — so the request is recorded for
 * real (a timestamped field on the customer record, visible to whoever
 * processes it) rather than an automated instant-delete the policy
 * doesn't yet define. See DECISION_LOG.md.
 */
export default function PrivacySecurity({ customer }: Props) {
  const [kind, setKind] = useState<"deletion" | "deactivation" | null>(null)
  const [state, formAction] = useActionState(requestAccountLifecycleChange, {
    success: false,
    error: null,
  })
  const confirmationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state.success) {
      // §22 — "focus moves to a confirmation message after an irreversible
      // action," never left on a button that no longer has the same
      // meaning once the action has been taken.
      confirmationRef.current?.focus()
    }
  }, [state.success])

  const addressCount = customer.addresses?.length ?? 0

  return (
    <div className="w-full" data-testid="privacy-security-page">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Privacy &amp; security</h1>
      </div>

      <div className="flex flex-col gap-y-8">
        <section>
          <h2 className="text-large-semi mb-2">Your data</h2>
          <Text className="text-ui-fg-base mb-4">
            This is the personal data your account holds today.
          </Text>
          <dl className="grid grid-cols-[140px_1fr] gap-y-2 text-small-regular">
            <dt className="text-ui-fg-subtle">Name</dt>
            <dd data-testid="privacy-name">
              {customer.first_name} {customer.last_name}
            </dd>
            <dt className="text-ui-fg-subtle">Email</dt>
            <dd data-testid="privacy-email">{customer.email}</dd>
            <dt className="text-ui-fg-subtle">Phone</dt>
            <dd data-testid="privacy-phone">{customer.phone || "—"}</dd>
            <dt className="text-ui-fg-subtle">Saved addresses</dt>
            <dd data-testid="privacy-address-count">{addressCount}</dd>
          </dl>
          <Text className="text-ui-fg-subtle mt-4">
            To correct any of this, use Profile or Addresses. The exact
            length of time this data is retained, and how it complies with
            Nigerian data-protection requirements (NDPR), hasn&apos;t been
            finalized yet — this page will be updated once that policy is
            set.
          </Text>
        </section>

        <section className="border-t border-gray-200 pt-8">
          <h2 className="text-large-semi mb-2">Leave LiquorCentral</h2>
          <Text className="text-ui-fg-base mb-4">
            You can request that your account be deactivated (reversible) or
            deleted (not reversible). Either way, any order you&apos;ve
            already placed stays exactly as it was — this only affects your
            account itself.
          </Text>

          {state.success ? (
            <div
              ref={confirmationRef}
              tabIndex={-1}
              role="status"
              aria-live="polite"
              className="focus:outline-none rounded-rounded border border-ui-border-base bg-ui-bg-subtle p-4"
              data-testid="lifecycle-request-confirmation"
            >
              We&apos;ve recorded your {state.requested} request. Since the
              exact process for account {state.requested} hasn&apos;t been
              finalized yet, our team will follow up at the email on file to
              complete it. You&apos;ve been signed out of this session.
            </div>
          ) : (
            <>
              {kind ? (
                <form
                  action={formAction}
                  className="flex flex-col gap-y-2 max-w-sm"
                >
                  <input type="hidden" name="kind" value={kind} />
                  <Input
                    label="Confirm your password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    data-testid="lifecycle-password-input"
                  />
                  {state.error && (
                    <div
                      className="text-rose-500 text-small-regular"
                      role="alert"
                      aria-live="assertive"
                    >
                      {state.error}
                    </div>
                  )}
                  <div className="flex gap-x-3 mt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      data-testid="confirm-lifecycle-request-button"
                    >
                      Confirm {kind} request
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setKind(null)}
                      data-testid="cancel-lifecycle-request-button"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex gap-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setKind("deactivation")}
                    data-testid="request-deactivation-button"
                  >
                    Request deactivation
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setKind("deletion")}
                    data-testid="request-deletion-button"
                  >
                    Request deletion
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
