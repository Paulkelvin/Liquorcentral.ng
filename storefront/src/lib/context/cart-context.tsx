"use client"

import { deleteLineItem, updateLineItem } from "@lib/data/cart"
import {
  broadcastCartChange,
  onCartChangedInAnotherTab,
} from "@lib/util/cart-broadcast"
import { HttpTypes } from "@medusajs/types"
import { useRouter } from "next/navigation"
import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useOptimistic,
  useState,
} from "react"

type OptimisticAction =
  | { type: "setQuantity"; lineId: string; quantity: number }
  | { type: "remove"; lineId: string }
  | { type: "add"; item: HttpTypes.StoreCartLineItem }

/** Line-item money fields that scale with quantity, in major units. */
const SCALABLE_LINE_FIELDS = [
  "subtotal",
  "total",
  "original_total",
  "original_subtotal",
  "discount_total",
  "tax_total",
] as const

type MoneyBag = Record<string, unknown>

/**
 * Re-derives a line's money for a new quantity by scaling the server's
 * own figures for it, rather than recomputing from `unit_price`.
 *
 * That distinction is the whole point: `total / quantity` already has
 * any per-unit promotion, tax-inclusive rounding or price-list override
 * baked into it, so scaling preserves them, where `unit_price × qty`
 * would quietly discard a discount and show the customer a higher number
 * than they are actually charged.
 *
 * Fields the server never sent stay absent — this only ever scales a
 * figure that was already there.
 */
function scaleLineMoney(
  item: HttpTypes.StoreCartLineItem,
  nextQuantity: number
): HttpTypes.StoreCartLineItem {
  const previousQuantity = item.quantity
  const next = { ...item, quantity: nextQuantity } as MoneyBag

  if (previousQuantity > 0) {
    for (const field of SCALABLE_LINE_FIELDS) {
      const value = (item as unknown as MoneyBag)[field]
      if (typeof value === "number") {
        next[field] = (value / previousQuantity) * nextQuantity
      }
    }
  }

  return next as unknown as HttpTypes.StoreCartLineItem
}

const money = (value: unknown): number =>
  typeof value === "number" ? value : 0

/**
 * Moves the cart-level figures by the same amount the changed line moved.
 *
 * A delta rather than a re-sum of every line: not every line in an
 * optimistic cart necessarily carries every field (a line added moments
 * ago is built on the client), and summing a partially-populated list
 * would read as a sudden drop to near-zero rather than a small change.
 * Applying only the difference leaves every untouched figure exactly as
 * the server last stated it.
 *
 * Tax and shipping are deliberately left alone: both depend on an
 * address and a chosen delivery option that don't exist yet at cart
 * stage (the UI says "calculated at checkout" for precisely that
 * reason), so there is nothing here to scale that wouldn't be a guess.
 */
function applyCartDelta(
  cart: HttpTypes.StoreCart,
  subtotalDelta: number,
  totalDelta: number
): HttpTypes.StoreCart {
  const next = { ...cart } as MoneyBag

  if (typeof cart.item_subtotal === "number") {
    next.item_subtotal = cart.item_subtotal + subtotalDelta
  }
  if (typeof cart.subtotal === "number") {
    next.subtotal = cart.subtotal + subtotalDelta
  }
  if (typeof cart.total === "number") {
    next.total = cart.total + totalDelta
  }

  return next as unknown as HttpTypes.StoreCart
}

/**
 * Applies a pending change to the cart the customer is looking at, so a
 * quantity tap or a removal shows immediately rather than after a server
 * round trip.
 *
 * **This now moves money as well as quantities, which is a reversal.**
 * It previously touched quantity and line membership only, on the
 * reasoning that Medusa owns every figure and a client-side guess risks
 * showing a price the customer isn't charged. The quantity therefore
 * changed instantly while the line price and the subtotal sat on their
 * old values until the round trip landed — Paul's own read: the stepper
 * is fast "but the price is not." Since the figures here are *scaled
 * from the server's own numbers* rather than recomputed from scratch
 * (see `scaleLineMoney`), and since the authoritative cart still
 * overwrites all of it the moment it arrives, the risk that motivated
 * the original rule doesn't apply to the fields being touched. Anything
 * genuinely unknowable before checkout — tax, delivery — is still left
 * untouched rather than guessed.
 */
function reduceOptimistic(
  cart: HttpTypes.StoreCart | null,
  action: OptimisticAction
): HttpTypes.StoreCart | null {
  if (!cart) {
    return cart
  }

  switch (action.type) {
    case "setQuantity": {
      const items = cart.items ?? []
      const target = items.find((item) => item.id === action.lineId)
      if (!target) {
        return cart
      }

      const scaled = scaleLineMoney(target, action.quantity)

      return applyCartDelta(
        {
          ...cart,
          items: items.map((item) => (item.id === action.lineId ? scaled : item)),
        },
        money(scaled.subtotal) - money(target.subtotal),
        money(scaled.total) - money(target.total)
      )
    }
    case "remove": {
      const items = cart.items ?? []
      const target = items.find((item) => item.id === action.lineId)

      return applyCartDelta(
        {
          ...cart,
          items: items.filter((item) => item.id !== action.lineId),
        },
        -money(target?.subtotal),
        -money(target?.total)
      )
    }
    case "add": {
      const items = cart.items ?? []
      const variantId = action.item.variant_id ?? action.item.variant?.id
      const existingIndex = variantId
        ? items.findIndex((item) => item.variant_id === variantId)
        : -1

      // Already in the cart — bump the existing line's quantity in place
      // (matching only, never touching `total`/`unit_price`, per this
      // function's own rule above) rather than appending a second line
      // that would only get merged away again once the real `addToCart`
      // resolves. Without this, adding a product already in the cart
      // flashed a duplicate line that then collapsed back into one the
      // moment the server responded — visible, jarring, and needless: the
      // server was always going to merge these into a single line, so the
      // optimistic view should already show that outcome.
      if (existingIndex !== -1) {
        const target = items[existingIndex]
        const scaled = scaleLineMoney(
          target,
          target.quantity + action.item.quantity
        )

        return applyCartDelta(
          {
            ...cart,
            items: items.map((item, index) =>
              index === existingIndex ? scaled : item
            ),
          },
          money(scaled.subtotal) - money(target.subtotal),
          money(scaled.total) - money(target.total)
        )
      }

      return applyCartDelta(
        {
          ...cart,
          items: [...items, action.item],
        },
        money(action.item.subtotal),
        money(action.item.total)
      )
    }
    default:
      return cart
  }
}

type CartContextValue = {
  /** The cart to render: the server cart with any in-flight change applied. */
  cart: HttpTypes.StoreCart | null
  /** Summed line quantities, reflecting in-flight changes. */
  totalItems: number
  /** True while a cart mutation is in flight — totals are settling. */
  isPending: boolean
  /**
   * The site's one flat "Standard delivery" rate (major units), fetched
   * once in the `(main)` layout alongside `FreeShippingPriceNudge`'s own
   * shipping-options call. `null` before that fetch resolves or when
   * there's no cart yet. See `CartTotals`'s own `knownDeliveryFee` prop
   * for why this is safe to show before a shipping method is attached.
   */
  standardDeliveryFee: number | null
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  /** `onError` is optional — a caller with somewhere to show a failure
   *  (a genuine stock/validation error) can pass one; otherwise a failed
   *  change just rolls back silently, as before. */
  setQuantity: (
    lineId: string,
    quantity: number,
    onError?: (error: unknown) => void
  ) => void
  removeItem: (lineId: string, onError?: (error: unknown) => void) => void
  /**
   * Paints a synthetic line item into the cart immediately, then runs
   * the real `addToCart` (and anything chained after it, like gift
   * wrap) behind it. Without this the drawer opened on the item it
   * already knew about — the add itself only appeared once
   * `revalidateTag` round-tripped a fresh server cart back down, which
   * on a real connection reads as the drawer opening a beat before the
   * product does.
   */
  addItem: (
    item: HttpTypes.StoreCartLineItem,
    run: () => Promise<unknown>,
    onError?: (error: unknown) => void
  ) => void
}

const CartContext = createContext<CartContextValue | null>(null)

/**
 * The cart's client-side surface. Mounted in the (main) layout above the
 * nav so the drawer, the cart badge and every add-to-cart button share
 * one source of truth.
 *
 * `initialCart` is not copied into state: it is the server cart, passed
 * down on every render, and `useOptimistic` layers pending changes on
 * top of it. When a server action finishes and `revalidateTag` re-renders
 * the layout, the new cart arrives as a prop and the optimistic overlay
 * clears itself — so the server stays authoritative without this
 * provider having to reconcile anything by hand.
 */
export function CartProvider({
  initialCart,
  standardDeliveryFee = null,
  children,
}: {
  initialCart: HttpTypes.StoreCart | null
  standardDeliveryFee?: number | null
  children: React.ReactNode
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [cart, applyOptimistic] = useOptimistic(initialCart, reduceOptimistic)
  const router = useRouter()

  const openDrawer = useCallback(() => setIsDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  // Cross-tab sync — see cart-broadcast.ts's own comment for the bug this
  // closes. A *different* tab changing the cart (add-to-cart, quantity,
  // remove — any of them, including the ones that never touch this
  // context, like the PDP's add-to-cart button) marks the shared
  // localStorage key; this tab hears it via `storage` and refreshes the
  // server data, which re-fetches the real cart and flows back down as
  // `initialCart` — reconciling this tab the same way its own optimistic
  // state already reconciles against the server after its own mutations.
  useEffect(() => onCartChangedInAnotherTab(() => router.refresh()), [router])

  /**
   * Every mutation follows the same shape: paint the change, run the
   * server action, and let revalidation deliver the authoritative cart.
   * A failure needs no rollback of its own — React discards the
   * optimistic value when the transition settles, so the UI snaps back
   * to whatever the server actually holds.
   */
  const mutate = useCallback(
    (
      action: OptimisticAction,
      run: () => Promise<unknown>,
      onError?: (error: unknown) => void
    ) => {
      setPendingCount((count) => count + 1)
      startTransition(async () => {
        applyOptimistic(action)
        try {
          await run()
          // Tell any other open tab this cart just changed — see the
          // cross-tab sync note above `useEffect`.
          broadcastCartChange()
        } catch (error) {
          // The optimistic value itself needs no rollback of its own —
          // React drops it when the transition ends, so the UI snaps
          // back to whatever the server actually holds. `onError` is
          // only how a genuine failure (e.g. requested quantity exceeds
          // stock) reaches a caller that has somewhere to show it; a
          // caller that passes nothing gets the original silent-rollback
          // behaviour.
          onError?.(error)
        } finally {
          setPendingCount((count) => Math.max(0, count - 1))
        }
      })
    },
    [applyOptimistic]
  )

  const setQuantity = useCallback(
    (lineId: string, quantity: number, onError?: (error: unknown) => void) => {
      if (quantity <= 0) {
        mutate({ type: "remove", lineId }, () => deleteLineItem(lineId), onError)
        return
      }
      mutate(
        { type: "setQuantity", lineId, quantity },
        () => updateLineItem({ lineId, quantity }),
        onError
      )
    },
    [mutate]
  )

  const removeItem = useCallback(
    (lineId: string, onError?: (error: unknown) => void) => {
      mutate({ type: "remove", lineId }, () => deleteLineItem(lineId), onError)
    },
    [mutate]
  )

  const addItem = useCallback(
    (
      item: HttpTypes.StoreCartLineItem,
      run: () => Promise<unknown>,
      onError?: (error: unknown) => void
    ) => {
      mutate({ type: "add", item }, run, onError)
    },
    [mutate]
  )

  const totalItems = useMemo(
    () => cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    [cart]
  )

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      totalItems,
      isPending: pendingCount > 0,
      standardDeliveryFee,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      setQuantity,
      removeItem,
      addItem,
    }),
    [
      cart,
      totalItems,
      pendingCount,
      standardDeliveryFee,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      setQuantity,
      removeItem,
      addItem,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used inside a CartProvider")
  }
  return context
}

/**
 * `useCart` on purpose without the throw — for a component that renders
 * in more than one tree, only some of which sit under `CartProvider`.
 * `Item` (`cart/components/item`) is the reason this exists: it renders
 * both on the `/cart` page (wrapped in `CartProvider` by the `(main)`
 * layout) and inside checkout's own order-summary preview (the
 * `(checkout)` route group has its own minimal, distraction-free layout
 * with no `CartProvider` — deliberately, not an oversight). The preview
 * row never actually calls `setQuantity`/`removeItem`, so `null` here is
 * always safe there; a genuine missing-provider bug anywhere `useCart`'s
 * guarantee actually matters still throws, since every other call site
 * keeps using that hook, not this one.
 */
export function useOptionalCart() {
  return useContext(CartContext)
}
