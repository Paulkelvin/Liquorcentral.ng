"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { splitGiftWrapLines } from "@lib/util/cart-fulfillment"
import { resolveReorderDecision } from "@lib/util/reorder"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { HttpTypes } from "@medusajs/types"
import { addToCart } from "./cart"
import { listProducts } from "./products"

export const retrieveOrder = async (id: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreOrderResponse>(`/store/orders/${id}`, {
      method: "GET",
      query: {
        fields:
          "*payment_collections.payments,*items,*items.metadata,*items.variant,*items.product,+items.product.food_details.*,+items.product.wine_details.*",
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ order }) => order)
    .catch((err) => medusaError(err))
}

export const listOrders = async (
  limit: number = 10,
  offset: number = 0,
  filters?: Record<string, unknown>
) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreOrderListResponse>(`/store/orders`, {
      method: "GET",
      query: {
        limit,
        offset,
        order: "-created_at",
        fields: "*items,+items.metadata,*items.variant,*items.product",
        ...filters,
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ orders }) => orders)
    .catch((err) => medusaError(err))
}

export const createTransferRequest = async (
  state: {
    success: boolean
    error: string | null
    order: HttpTypes.StoreOrder | null
  },
  formData: FormData
): Promise<{
  success: boolean
  error: string | null
  order: HttpTypes.StoreOrder | null
}> => {
  const id = formData.get("order_id") as string

  if (!id) {
    return { success: false, error: "Order ID is required", order: null }
  }

  const headers = await getAuthHeaders()

  return await sdk.store.order
    .requestTransfer(
      id,
      {},
      {
        fields: "id, email",
      },
      headers
    )
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const acceptTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .acceptTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const declineTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .declineTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export type ReorderResult = {
  addedCount: number
  unavailable: string[]
  priceChanged: string[]
}

/**
 * 08_CUSTOMER_ACCOUNT_SPECIFICATION.md §15 — "re-validated against current
 * availability and pricing, never a blind copy of the old order... a
 * partially-reorderable order still reorders what it can." Gift-wrap lines
 * (metadata-linked, `cart-fulfillment.ts`'s own `splitGiftWrapLines`) are
 * deliberately excluded — re-adding a wrap tied to a specific past line
 * item id has no meaning in a brand-new cart; the customer can re-select
 * Gift Wrap fresh from the new cart if they want it again, a deliberate v1
 * simplification, not silently smoothed over.
 */
export async function reorderItems(
  orderId: string,
  countryCode: string
): Promise<ReorderResult> {
  const order = await retrieveOrder(orderId)
  const { productLines } = splitGiftWrapLines(
    (order.items ?? []) as unknown as HttpTypes.StoreCartLineItem[]
  )

  const productIds = Array.from(
    new Set(
      productLines
        .map((item) => item.product_id)
        .filter((id): id is string => !!id)
    )
  )

  const { response } = productIds.length
    ? await listProducts({ countryCode, queryParams: { id: productIds, limit: productIds.length } })
    : { response: { products: [] as HttpTypes.StoreProduct[], count: 0 } }

  const variantById = new Map<string, HttpTypes.StoreProductVariant>()
  for (const product of response.products) {
    for (const variant of product.variants ?? []) {
      if (variant.id) {
        variantById.set(variant.id, variant)
      }
    }
  }

  const result: ReorderResult = { addedCount: 0, unavailable: [], priceChanged: [] }

  for (const line of productLines) {
    const title = line.product_title || line.title || "Item"
    const variant = line.variant_id ? variantById.get(line.variant_id) : undefined
    const decision = resolveReorderDecision(line, variant)

    if (decision.action === "unavailable" || !line.variant_id) {
      result.unavailable.push(title)
      continue
    }

    try {
      const addedLine = await addToCart({
        variantId: line.variant_id,
        quantity: decision.quantity,
        countryCode,
      })
      result.addedCount += 1

      if (addedLine && addedLine.unit_price !== line.unit_price) {
        result.priceChanged.push(title)
      }
    } catch {
      result.unavailable.push(title)
    }
  }

  return result
}
