"use client"

import { reorderItems } from "@lib/data/orders"
import { useParams, useRouter } from "next/navigation"
import { Button, Text } from "@modules/common/components/ui"
import { useState } from "react"

/**
 * 08_CUSTOMER_ACCOUNT_SPECIFICATION.md §15 — "a single Reorder action...
 * re-validated against current availability and pricing... a partially-
 * reorderable order still reorders what it can, with the customer told
 * plainly which items could not be re-added and why." The summary is
 * shown here, before navigating to the cart, so the customer sees it
 * regardless of whether they read the cart page carefully afterward.
 */
export default function ReorderButton({
  orderId,
  variant = "secondary",
}: {
  orderId: string
  variant?: "primary" | "secondary"
}) {
  const { countryCode } = useParams() as { countryCode: string }
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [summary, setSummary] = useState<{
    addedCount: number
    unavailable: string[]
    priceChanged: string[]
  } | null>(null)

  const handleReorder = async () => {
    setIsPending(true)
    const result = await reorderItems(orderId, countryCode)
    setIsPending(false)
    setSummary(result)

    if (result.addedCount > 0) {
      router.push(`/${countryCode}/cart`)
    }
  }

  return (
    <div className="flex flex-col gap-y-2">
      <Button
        variant={variant}
        isLoading={isPending}
        onClick={handleReorder}
        data-testid="reorder-button"
      >
        Reorder
      </Button>
      {summary && (
        <div role="status" aria-live="polite" className="text-compact-small">
          {summary.addedCount === 0 && summary.unavailable.length > 0 && (
            <Text className="text-danger">
              None of these items are available to reorder anymore.
            </Text>
          )}
          {summary.unavailable.length > 0 && summary.addedCount > 0 && (
            <Text className="text-ui-fg-subtle">
              {summary.unavailable.length} item
              {summary.unavailable.length === 1 ? "" : "s"} could not be
              re-added ({summary.unavailable.join(", ")}) — no longer
              available.
            </Text>
          )}
          {summary.priceChanged.length > 0 && (
            <Text className="text-ui-fg-subtle">
              {summary.priceChanged.join(", ")}{" "}
              {summary.priceChanged.length === 1 ? "has" : "have"} changed in
              price since this order.
            </Text>
          )}
        </div>
      )}
    </div>
  )
}
