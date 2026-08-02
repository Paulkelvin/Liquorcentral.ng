"use client"

import { IconBag } from "@modules/common/icons"
import { useCart } from "@lib/context/cart-context"

/**
 * The nav's cart control. Opens the slide-out drawer.
 *
 * This used to be a hover-only mini-cart in a Headless UI `Popover`,
 * whose panel was `hidden small:block` — so on touch, where there is no
 * hover, the icon was only ever a link to `/cart` and there was no
 * mini-cart at all. A plain `<button>` opening a Dialog serves both
 * input models with one interaction, and sidesteps the class of bug
 * documented on the old trigger, where making it a `PopoverButton`
 * silently swallowed navigation on touch.
 *
 * The count comes from the cart context, so it reflects an optimistic
 * add immediately rather than waiting for the server round trip.
 */
const CartTrigger = () => {
  const { totalItems, openDrawer } = useCart()

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`Cart, ${totalItems} item${totalItems === 1 ? "" : "s"}`}
      aria-haspopup="dialog"
      className="relative inline-flex h-full min-w-[44px] items-center justify-center gap-1.5 transition-colors duration-standard ease-in-out hover:text-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      data-testid="nav-cart-link"
    >
      <span className="relative inline-flex">
        <IconBag aria-hidden="true" />
        {totalItems > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1.5 h-[16px] min-w-[16px] rounded-full bg-primary px-[3px] text-center text-[10px] font-semibold leading-[16px] text-surface-elevated"
            data-testid="nav-cart-count"
          >
            {totalItems}
          </span>
        )}
      </span>
      <span aria-hidden="true" className="hidden small:inline">
        Cart
      </span>
    </button>
  )
}

export default CartTrigger
