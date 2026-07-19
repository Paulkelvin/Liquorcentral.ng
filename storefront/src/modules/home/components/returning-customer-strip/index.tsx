import { retrieveCustomer } from "@lib/data/customer"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text } from "@modules/common/components/ui"
import { HttpTypes } from "@medusajs/types"

// `StoreCustomer`'s static type doesn't declare `orders`, even though
// `retrieveCustomer()` fetches it via `fields: "*orders"` (the same gap
// Navigation's product.categories fix hit — the linked field isn't part
// of the base DTO's static type, only present at runtime).
type CustomerWithOrders = HttpTypes.StoreCustomer & {
  orders?: HttpTypes.StoreOrder[]
}

/**
 * 02_HOMEPAGE_SPECIFICATION.md §8.8 — "shown only to logged-in customers
 * with at least one prior order... entirely absent (not a placeholder or
 * an empty state) for guests and first-time customers" (§19 restates
 * this explicitly). `retrieveCustomer()` already fetches `*orders`
 * (`src/lib/data/customer.ts`), so no extra query is needed. Each
 * shortcut labels what it re-adds (§8.8 accessibility requirement) —
 * order number plus item count, since order line items aren't fetched
 * here (fetching full line items for a homepage strip would be a heavier
 * query than this section needs; the order detail page itself is one tap
 * away).
 */
export default async function ReturningCustomerStrip() {
  const customer = (await retrieveCustomer()) as CustomerWithOrders | null
  const orders = customer?.orders?.slice(0, 3) ?? []

  if (orders.length === 0) {
    return null
  }

  return (
    <div className="content-container py-8 border-t border-divider">
      <Text className="txt-small-plus text-text-primary mb-4">
        Reorder from a recent order
      </Text>
      <ul className="flex gap-4 overflow-x-auto">
        {orders.map((order) => (
          <li key={order.id} className="shrink-0">
            <LocalizedClientLink
              href={`/account/orders/details/${order.id}`}
              className="flex flex-col gap-1 rounded-radius-md border border-border px-4 py-3 hover:bg-surface-elevated"
              aria-label={`Reorder: order #${order.display_id}, ${order.items?.length ?? 0} item${(order.items?.length ?? 0) === 1 ? "" : "s"}`}
            >
              <Text className="txt-small-plus">Order #{order.display_id}</Text>
              <Text muted className="txt-xsmall">
                {order.items?.length ?? 0} item
                {(order.items?.length ?? 0) === 1 ? "" : "s"}
              </Text>
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
