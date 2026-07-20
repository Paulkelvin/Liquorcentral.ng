import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Select, Text, toast } from "@medusajs/ui"
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { sdk } from "../lib/sdk"

/**
 * 10_DELIVERY_SPECIFICATION.md §10 — Wine & Spirits' own nationwide-
 * dispatch status progression, specified for the first time by that
 * document (Food Central's equivalent already exists via
 * `food-order-status-widget.tsx`): Order Placed -> Dispatched ->
 * In Transit -> Delivered. Stored on Order's own native `metadata`
 * field (`wine_delivery_status`) via the ordinary `POST /admin/orders/:id`
 * endpoint — same reasoning as the food-order-status widget, no new
 * route or migration needed.
 *
 * Shown on every order, same unconditional-visibility reasoning as the
 * food-order-status widget — an order with no Wine & Spirits items
 * simply leaves this unset, and the storefront only displays the
 * progression when a value is actually present (see storefront's
 * wine-delivery-status/index.tsx).
 */
const STAGES = [
  { value: "order_placed", label: "Order Placed" },
  { value: "dispatched", label: "Dispatched" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
] as const

type WineDeliveryStatusQueryResult = {
  order: AdminOrder & { metadata?: Record<string, unknown> | null }
}

const WineDeliveryStatusWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const queryClient = useQueryClient()
  const [stage, setStage] = useState<string>("")

  const { data: queryResult, isLoading } = useQuery({
    queryKey: ["order", data.id, "wine_delivery_status"],
    queryFn: () =>
      sdk.client.fetch<WineDeliveryStatusQueryResult>(
        `/admin/orders/${data.id}`,
        { query: { fields: "id,metadata" } }
      ),
  })

  const existingMetadata = queryResult?.order.metadata ?? {}

  useEffect(() => {
    const current = (queryResult?.order.metadata ?? {}).wine_delivery_status
    setStage(typeof current === "string" ? current : "")
  }, [queryResult])

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (nextStage: string) =>
      sdk.admin.order.update(data.id, {
        metadata: { ...existingMetadata, wine_delivery_status: nextStage },
      }),
    onSuccess: () => {
      toast.success("Delivery status saved")
      queryClient.invalidateQueries({
        queryKey: ["order", data.id, "wine_delivery_status"],
      })
    },
    onError: (error: Error) => {
      toast.error("Could not save delivery status", {
        description: error.message,
      })
    },
  })

  const handleChange = (value: string) => {
    setStage(value)
    mutateAsync(value)
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Wine &amp; Spirits Delivery Status</Heading>
      </div>
      <div className="px-6 py-4">
        <Text size="small" className="text-ui-fg-subtle mb-4">
          Only meaningful for orders containing Wine &amp; Spirits items —
          leave unset for a Food Central-only order. No stage may be
          skipped or shown out of order to the customer (§10); set stages
          in sequence as dispatch genuinely progresses.
        </Text>
        {isLoading ? (
          <Text size="small">Loading...</Text>
        ) : (
          <Select value={stage} onValueChange={handleChange} disabled={isPending}>
            <Select.Trigger>
              <Select.Value placeholder="Not set" />
            </Select.Trigger>
            <Select.Content>
              {STAGES.map((s) => (
                <Select.Item key={s.value} value={s.value}>
                  {s.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default WineDeliveryStatusWidget
