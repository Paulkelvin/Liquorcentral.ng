"use client"

import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname, useRouter } from "next/navigation"

/**
 * 07_CHECKOUT_SPECIFICATION.md §8, §11 — the authoritative address/
 * eligibility blocking condition `06_CART_SPECIFICATION.md` §10 deferred to
 * checkout: a Food Central item plus a delivery address that doesn't look
 * like Lagos. Named resolution options only — the item is never silently
 * dropped or re-routed (§8's explicit requirement). Classified as a
 * **blocking condition** in both documents' shared Customer Decision
 * States vocabulary, announced via `role="alert"` since it must interrupt
 * rather than wait to be discovered.
 */
export default function DeliveryEligibilityConflict() {
  const router = useRouter()
  const pathname = usePathname()

  const handleChangeAddress = () => {
    router.push(pathname + "?step=address", { scroll: false })
  }

  return (
    <div
      role="alert"
      className="bg-white border border-danger rounded-radius-sm p-6 mb-8"
      data-testid="delivery-eligibility-conflict"
    >
      <Heading level="h2" className="text-xl-semi text-text-primary mb-2">
        Food Central can&apos;t deliver to this address
      </Heading>
      <Text className="text-text-secondary mb-4">
        Food Central delivers within Lagos only, and the address you entered
        doesn&apos;t appear to be in Lagos. Resolve this before continuing to
        payment:
      </Text>
      <ul className="flex flex-col gap-y-3 text-body">
        <li>
          <button
            type="button"
            onClick={handleChangeAddress}
            className="text-interactive hover:text-interactive-hover underline"
            data-testid="eligibility-change-address"
          >
            Change delivery address
          </button>
        </li>
        <li>
          <Text as="span">
            Choose <strong>Pick up your order</strong> in the Delivery step
            below, or
          </Text>
        </li>
        <li>
          <LocalizedClientLink
            href="/cart"
            className="text-interactive hover:text-interactive-hover underline"
            data-testid="eligibility-remove-item"
          >
            Remove the Food Central item(s) from your order
          </LocalizedClientLink>
        </li>
      </ul>
    </div>
  )
}
