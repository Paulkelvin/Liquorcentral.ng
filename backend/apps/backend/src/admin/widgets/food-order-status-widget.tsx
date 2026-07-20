import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Select, Text, toast } from "@medusajs/ui"
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { sdk } from "../lib/sdk"

/**
 * 09_FOOD_ORDERING_SPECIFICATION.md §7 — the cook-to-order status
 * progression: Order Received -> Preparing -> Ready (pickup) / Out for
 * Delivery -> Completed. The spec names this exact minimum stage set as
 * decided; only finer sub-granularity is left open (§25, §28). Stored on
 * Order's own native `metadata` field (`food_order_status`) via the
 * ordinary `POST /admin/orders/:id` endpoint — metadata is already a
 * validated field on that route, so no custom route or migration is
 * needed, consistent with `API_DECISIONS.md`'s "use native routes as-is"
 * principle already applied by the food/wine-details widgets.
 *
 * Shown on every order, same unconditional-visibility reasoning as the
 * product attribute widgets — an order with no Food Central items simply
 * leaves this unset, and the storefront only displays the progression
 * when a value is actually present (see storefront's
 * food-order-status/index.tsx).
 */
const STAGES = [
  { value: "order_received", label: "Order Received" },
  { value: "preparing", label: "Preparing" },
  { value: "ready_for_pickup", label: "Ready for Pickup" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "completed", label: "Completed" },
] as const

type FoodOrderStatusQueryResult = {
  order: AdminOrder & { metadata?: Record<string, unknown> | null }
}

const FoodOrderStatusWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const queryClient = useQueryClient()
  const [stage, setStage] = useState<string>("")

  const { data: queryResult, isLoading } = useQuery({
    queryKey: ["order", data.id, "food_order_status"],
    queryFn: () =>
      sdk.client.fetch<FoodOrderStatusQueryResult>(
        `/admin/orders/${data.id}`,
        { query: { fields: "id,metadata" } }
      ),
  })

  const existingMetadata = queryResult?.order.metadata ?? {}

  useEffect(() => {
    const current = (queryResult?.order.metadata ?? {}).food_order_status
    setStage(typeof current === "string" ? current : "")
  }, [queryResult])

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (nextStage: string) =>
      sdk.admin.order.update(data.id, {
        metadata: { ...existingMetadata, food_order_status: nextStage },
      }),
    onSuccess: () => {
      toast.success("Order status saved")
      queryClient.invalidateQueries({
        queryKey: ["order", data.id, "food_order_status"],
      })
    },
    onError: (error: Error) => {
      toast.error("Could not save order status", {
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
        <Heading level="h2">Food Central Order Status</Heading>
      </div>
      <div className="px-6 py-4">
        <Text size="small" className="text-ui-fg-subtle mb-4">
          Only meaningful for orders containing Food Central items — leave
          unset for a Wine &amp; Spirits-only order. No stage may be skipped
          or shown out of order to the customer (§7); set stages in
          sequence as the kitchen genuinely progresses.
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

export default FoodOrderStatusWidget
