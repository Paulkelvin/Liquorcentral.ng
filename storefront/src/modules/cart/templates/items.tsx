import { HttpTypes } from "@medusajs/types"
import { Heading, Table, Text } from "@modules/common/components/ui"
import { convertToLocale } from "@lib/util/money"
import repeat from "@lib/util/repeat"
import { listProducts } from "@lib/data/products"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
  countryCode: string
}

type ProductWithCatalog = {
  food_details?: unknown
  wine_details?: unknown
}

function isFoodCentralItem(item: HttpTypes.StoreCartLineItem) {
  return !!(item.product as ProductWithCatalog | undefined)?.food_details
}

const GROUPS = [
  {
    key: "wine" as const,
    heading: "Wine & Spirits — Nationwide Delivery",
    delivery: "Delivered across Lagos.",
  },
  {
    key: "food" as const,
    heading: "Food Central — Lagos Delivery & Pickup",
    delivery:
      "Delivered within Lagos Island, same-day, scheduled, or pickup. Cooked to order — not held stock.",
  },
]

/**
 * 06_CART_SPECIFICATION.md §5/§6 — the specification's own "most
 * consequential section": a mixed cart is rendered as two visually
 * distinct fulfillment-leg groups (never interleaved in add-order),
 * each with its own heading naming its catalog and delivery model, its
 * own subtotal, and its own delivery messaging — never merged or
 * averaged into one promise (§17). Still one cart, one checkout action
 * (§5) — the grouping is presentation only.
 *
 * Delivery-scope wording mirrors `TrustDeliveryInfo`'s own copy on the
 * product detail page (05_PRODUCT_DETAILS_SPECIFICATION.md §19–§21) for
 * consistency, reflecting the same launch-scope delivery-area decision
 * (`DECISION_LOG.md`) — Food Central within Lagos Island, Wine & Spirits
 * across all of Lagos.
 */
const ItemsTemplate = async ({ cart, countryCode }: ItemsTemplateProps) => {
  const items = cart?.items

  if (!items) {
    return (
      <div>
        <div className="pb-3 flex items-center">
          <Heading className="text-[2rem] leading-[2.75rem]">Cart</Heading>
        </div>
        <Table>
          <Table.Body>
            {repeat(5).map((i) => (
              <SkeletonLineItem key={i} />
            ))}
          </Table.Body>
        </Table>
      </div>
    )
  }

  const sorted = [...items].sort((a, b) =>
    (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
  )

  const groupedItems: Record<"wine" | "food", HttpTypes.StoreCartLineItem[]> = {
    wine: sorted.filter((item) => !isFoodCentralItem(item)),
    food: sorted.filter((item) => isFoodCentralItem(item)),
  }

  const currencyCode = cart?.currency_code

  /**
   * The Cart endpoint's own `items.variant.inventory_quantity` field
   * expansion does not resolve (confirmed via direct API inspection,
   * bypassing all caching, that it returns `null` for genuinely stocked
   * variants) — a real limitation of Medusa v2's Cart query graph, not a
   * caching artifact. `/store/products` resolves the same field
   * reliably, so it is used here as a supplementary lookup instead of
   * trusting the cart's own expansion.
   */
  const productIds = Array.from(
    new Set(items.map((item) => item.product_id).filter((id): id is string => !!id))
  )

  const inventoryByVariantId: Record<string, number | undefined> = {}

  if (productIds.length > 0) {
    const {
      response: { products },
    } = await listProducts({
      countryCode,
      queryParams: { id: productIds, limit: productIds.length },
    })

    products.forEach((product) => {
      product.variants?.forEach((variant) => {
        if (variant.id) {
          inventoryByVariantId[variant.id] = (
            variant as HttpTypes.StoreProductVariant & {
              inventory_quantity?: number
            }
          ).inventory_quantity
        }
      })
    })
  }

  return (
    <div>
      <div className="pb-3 flex items-center">
        <Heading className="text-[2rem] leading-[2.75rem]">Cart</Heading>
      </div>

      {GROUPS.map((group) => {
        const groupItems = groupedItems[group.key]
        if (groupItems.length === 0) {
          return null
        }
        const groupSubtotal = groupItems.reduce(
          (sum, item) => sum + (item.total ?? 0),
          0
        )

        return (
          <div key={group.key} className="mb-8" data-testid={`cart-group-${group.key}`}>
            {/* §6 — "distinct group labeling... never a generic 'Group
                1/Group 2' or unlabeled visual separation alone." Shown
                for every group present, not only when the cart is mixed
                — a single-catalog cart still benefits from §1's "as
                early as the cart" delivery-scope disclosure. */}
            <div className="mb-2">
              <Text as="p" className="font-semibold">
                {group.heading}
              </Text>
              <Text as="p" size="caption" muted>
                {group.delivery}
              </Text>
            </div>
            <Table>
              <Table.Header className="border-t-0">
                <Table.Row className="text-ui-fg-subtle txt-medium-plus">
                  <Table.HeaderCell className="!pl-0">Item</Table.HeaderCell>
                  <Table.HeaderCell></Table.HeaderCell>
                  <Table.HeaderCell>Quantity</Table.HeaderCell>
                  <Table.HeaderCell className="hidden small:table-cell">
                    Price
                  </Table.HeaderCell>
                  <Table.HeaderCell className="!pr-0 text-right">
                    Total
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {groupItems.map((item) => (
                  <Item
                    key={item.id}
                    item={item}
                    currencyCode={currencyCode}
                    inventoryQuantity={
                      item.variant_id ? inventoryByVariantId[item.variant_id] : undefined
                    }
                  />
                ))}
              </Table.Body>
            </Table>
            <div className="flex justify-end pt-2">
              <Text as="p" size="caption" data-testid={`cart-group-${group.key}-subtotal`}>
                {group.key === "wine" ? "Wine & Spirits" : "Food Central"} subtotal:{" "}
                <span className="font-semibold text-text-primary">
                  {convertToLocale({ amount: groupSubtotal, currency_code: currencyCode })}
                </span>
              </Text>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ItemsTemplate
