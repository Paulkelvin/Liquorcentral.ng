import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"

/**
 * 11_ADMIN_WORKFLOWS_SPECIFICATION.md §5 — "an at-a-glance operational
 * overview... order volume and status mix, the food-order queue, delivery
 * status summary... surfaced here." Medusa Admin has no dedicated
 * dashboard/home injection zone (confirmed directly against
 * `@medusajs/admin-shared`'s own zone list) — `order.list.before` is the
 * honest choice given that constraint, since order volume/status is §5's
 * primary content and this is the closest native surface to a "home"
 * view, consistent with §5's own "built as Medusa Admin widgets and
 * routes, not a bespoke application" instruction.
 *
 * §64/Cross-Catalog Operational Parity — Wine & Spirits and Food Central
 * counts are shown with equal visual weight, neither implicitly primary.
 *
 * Deliberately a snapshot over the most recent orders, not a full
 * historical aggregation pipeline — §18 names a dedicated reporting/BI
 * mechanism as "not yet built," and this document itself specifies only
 * that an at-a-glance overview exists, not its exact composition. Stated
 * honestly as "last N orders," never presented as a lifetime total.
 */
const SAMPLE_SIZE = 50

type DashboardOrder = {
  id: string
  fulfillment_status: string
  metadata?: Record<string, unknown> | null
  items?: {
    product?: { food_details?: unknown; wine_details?: unknown } | null
  }[]
}

type DashboardQueryResult = {
  orders: DashboardOrder[]
  count: number
}

const FOOD_QUEUE_STAGES = new Set(["order_received", "preparing"])
const WINE_IN_PROGRESS_STAGES = new Set(["order_placed", "dispatched", "in_transit"])

const OperationsDashboardWidget = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-operations-dashboard"],
    queryFn: () =>
      sdk.admin.order.list({
        limit: SAMPLE_SIZE,
        order: "-created_at",
        fields:
          "id,fulfillment_status,metadata,+items.product.food_details.id,+items.product.wine_details.id",
      }) as unknown as Promise<DashboardQueryResult>,
  })

  const orders = data?.orders ?? []

  const foodQueueCount = orders.filter((order) => {
    const hasFood = order.items?.some((item) => !!item.product?.food_details)
    const stage = order.metadata?.food_order_status
    return hasFood && typeof stage === "string" && FOOD_QUEUE_STAGES.has(stage)
  }).length

  const wineInProgressCount = orders.filter((order) => {
    const hasWine = order.items?.some((item) => !!item.product?.wine_details)
    const stage = order.metadata?.wine_delivery_status
    return (
      hasWine && typeof stage === "string" && WINE_IN_PROGRESS_STAGES.has(stage)
    )
  }).length

  const notFulfilledCount = orders.filter(
    (order) => order.fulfillment_status === "not_fulfilled"
  ).length

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Operations Overview</Heading>
      </div>
      <div className="px-6 py-4">
        {isLoading ? (
          <Text size="small">Loading...</Text>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Text size="small" className="text-ui-fg-subtle">
                Orders (total)
              </Text>
              <Text size="xlarge" weight="plus">
                {data?.count ?? 0}
              </Text>
            </div>
            <div>
              <Text size="small" className="text-ui-fg-subtle">
                Food Central queue
              </Text>
              <Text size="xlarge" weight="plus">
                {foodQueueCount}
              </Text>
            </div>
            <div>
              <Text size="small" className="text-ui-fg-subtle">
                Wine &amp; Spirits in transit
              </Text>
              <Text size="xlarge" weight="plus">
                {wineInProgressCount}
              </Text>
            </div>
          </div>
        )}
        <Text size="small" className="text-ui-fg-subtle mt-4">
          Food Central queue and Wine &amp; Spirits in-transit counts are
          based on the most recent {SAMPLE_SIZE} orders, not the full order
          history. {notFulfilledCount} of those {orders.length} are not yet
          fulfilled.
        </Text>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.list.before",
})

export default OperationsDashboardWidget
