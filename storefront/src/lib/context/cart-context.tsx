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

/**
 * Applies a pending change to the cart the customer is looking at, so a
 * quantity tap or a removal shows immediately rather than after a server
 * round trip.
 *
 * Deliberately touches quantities and line membership only — never a
 * price, a subtotal or a total. Medusa owns all money on this platform
 * (tax, delivery and promotions are computed server-side against the
 * region and the chosen shipping method), so recomputing any of it here
 * would risk showing a figure the customer is not actually charged.
 * Totals continue to come from the server cart; `isPending` lets the UI
 * mark them as settling instead of guessing at them.
 */
function reduceOptimistic(
  cart: HttpTypes.StoreCart | null,
  action: OptimisticAction
): HttpTypes.StoreCart | null {
  if (!cart) {
    return cart
  }

  switch (action.type) {
    case "setQuantity":
      return {
        ...cart,
        items: (cart.items ?? []).map((item) =>
          item.id === action.lineId
            ? { ...item, quantity: action.quantity }
            : item
        ),
      }
    case "remove":
      return {
        ...cart,
        items: (cart.items ?? []).filter((item) => item.id !== action.lineId),
      }
    case "add":
      return {
        ...cart,
        items: [...(cart.items ?? []), action.item],
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
  children,
}: {
  initialCart: HttpTypes.StoreCart | null
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
