"use client"

import { deleteLineItem, updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useMemo,
  useOptimistic,
  useState,
} from "react"

type OptimisticAction =
  | { type: "setQuantity"; lineId: string; quantity: number }
  | { type: "remove"; lineId: string }

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
  if (!cart?.items) {
    return cart
  }

  switch (action.type) {
    case "setQuantity":
      return {
        ...cart,
        items: cart.items.map((item) =>
          item.id === action.lineId
            ? { ...item, quantity: action.quantity }
            : item
        ),
      }
    case "remove":
      return {
        ...cart,
        items: cart.items.filter((item) => item.id !== action.lineId),
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
  setQuantity: (lineId: string, quantity: number) => void
  removeItem: (lineId: string) => void
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

  const openDrawer = useCallback(() => setIsDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  /**
   * Every mutation follows the same shape: paint the change, run the
   * server action, and let revalidation deliver the authoritative cart.
   * A failure needs no rollback of its own — React discards the
   * optimistic value when the transition settles, so the UI snaps back
   * to whatever the server actually holds.
   */
  const mutate = useCallback(
    (action: OptimisticAction, run: () => Promise<unknown>) => {
      setPendingCount((count) => count + 1)
      startTransition(async () => {
        applyOptimistic(action)
        try {
          await run()
        } catch {
          // Swallowed on purpose: the optimistic value is dropped when
          // the transition ends, which is the rollback. Surfacing the
          // error is the calling component's job where it has somewhere
          // to show it.
        } finally {
          setPendingCount((count) => Math.max(0, count - 1))
        }
      })
    },
    [applyOptimistic]
  )

  const setQuantity = useCallback(
    (lineId: string, quantity: number) => {
      if (quantity <= 0) {
        mutate({ type: "remove", lineId }, () => deleteLineItem(lineId))
        return
      }
      mutate({ type: "setQuantity", lineId, quantity }, () =>
        updateLineItem({ lineId, quantity })
      )
    },
    [mutate]
  )

  const removeItem = useCallback(
    (lineId: string) => {
      mutate({ type: "remove", lineId }, () => deleteLineItem(lineId))
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
