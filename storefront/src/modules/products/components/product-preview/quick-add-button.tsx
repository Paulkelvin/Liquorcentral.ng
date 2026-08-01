"use client"

import { addToCart } from "@lib/data/cart"
import { useCart } from "@lib/context/cart-context"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import { useParams } from "next/navigation"
import { MouseEvent, useState } from "react"

type QuickAddVariant = HttpTypes.StoreProductVariant & {
  calculated_price?: unknown
}

function isVariantPurchasable(variant?: QuickAddVariant) {
  if (!variant) {
    return false
  }
  if (!variant.manage_inventory) {
    return true
  }
  if (variant.allow_backorder) {
    return true
  }
  return (variant.inventory_quantity || 0) > 0
}

const sharedClass =
  "inline-flex items-center justify-center w-full min-h-[44px] py-2 px-4 text-[13px] font-medium rounded-radius-md transition-colors duration-standard ease-in-out active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"

/**
 * 04_PRODUCT_LISTING_SPECIFICATION.md §9 "Quick actions" — a sibling
 * control next to (never nested inside) the card's primary link. A card
 * has no option-selection UI, so quick-add can only resolve a variant
 * automatically when the product genuinely has just one (true for every
 * Food Central dish today — food-details.ts's own comment: "no dish
 * variants exist"; true for a Wine & Spirits product only when it has no
 * size/vintage variants). When more than one variant exists, this hands
 * off honestly to the product detail page's real option picker instead of
 * guessing which variant the customer meant — still reachable in one
 * click, just not a silent add.
 *
 * `department` controls the CTA's fill colour only (which catalog the
 * card belongs to), never whether the control exists or is reachable —
 * both departments stay in the DOM and keyboard/touch-operable at all
 * times (§14/§24: hover-only reveal is never the sole way to reach an
 * action).
 */
export default function QuickAddButton({
  product,
  className,
  department = "wine",
  appearance = "solid",
  size = "default",
}: {
  product: HttpTypes.StoreProduct
  className?: string
  department?: "wine" | "food"
  /**
   * `"icon"` draws the same control as a round icon button instead of a
   * full-width labelled one — used by the Today's Menu dish card, where a
   * heavy solid button competes with the food photography.
   *
   * **Only the drawing changes; every state and guarantee is the same
   * control.** The optimistic add, the error rollback, the hand-off to the
   * product page when a product has more than one variant, and the sold-out
   * case all still run. Two consequences that are easy to get wrong if this
   * is ever extended:
   *
   * - **An icon control needs a real accessible name**, so each branch below
   *   carries an `aria-label` naming the product. Without it a screen reader
   *   hears "button" four times in a row with nothing to tell them apart.
   * - **Sold out stays text even in icon mode.** There is no icon that says
   *   "sold out" unambiguously, and a disabled-looking circle would leave
   *   the customer guessing.
   */
  appearance?: "solid" | "icon"
  /**
   * `"compact"` draws the button at 38px instead of 44px, for the product
   * card — where a full 44px solid slab under 15px type was the loudest
   * element on a page built around restraint.
   *
   * **It shrinks the drawing, never the target.** `DESIGN_SYSTEM.md` §B11
   * fixes a 44×44px minimum "regardless of visual size" and anticipates
   * exactly this ("a small visual icon can still sit inside a larger tap
   * area"), so the missing 6px come back as an invisible `::before`. Same
   * technique as the compact quantity stepper, the footer social icons and
   * the pairing carousel's dots.
   *
   * **Consequence: a compact button must never gain `overflow-hidden`** —
   * it would clip the expanded hit area along with everything else and
   * silently void the guarantee.
   */
  size?: "default" | "compact"
}) {
  const countryCode = useParams().countryCode as string
  const { openDrawer } = useCart()
  const [status, setStatus] = useState<"idle" | "added" | "error">(
    "idle"
  )

  const variants = product.variants ?? []
  const singleVariant = variants.length === 1 ? variants[0] : undefined
  const hasMultipleVariants = variants.length > 1

  // Both catalogs get the same high-contrast solid CTA — §9's original
  // primary/secondary weight split is gone, because the quiet fill that
  // carried the "secondary" half read as washed out against both the
  // card and the page. The catalogs stay distinguishable by *hue*
  // instead of by weight: Wine & Spirits in the brand accent (white on
  // it measures 5.40:1), Food Central in ink-900 (16.1:1). Neither is
  // subordinate to the other.
  const isIcon = appearance === "icon"
  const isCompact = size === "compact"

  // `min-h-[38px]` needs no `!`: it is applied *after* `sharedClass` in the
  // same `clx` call, and `min-h-[44px]` there is the only competitor, so
  // Tailwind's emit order for two `min-h` arbitrary values is the tie —
  // which is exactly the kind of coin-flip this project has been bitten by
  // before. Hence the explicit `!` below rather than trusting it.
  const compactClass = isCompact
    ? "!min-h-[38px] py-1.5 before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-full before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] relative"
    : ""

  // The icon form keeps the full 44px target: it *is* 44px, no expansion
  // trickery needed (DESIGN_SYSTEM.md §B11).
  const iconShape =
    "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-radius-full transition-colors duration-standard ease-in-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"

  const variantClass = clx(
    isIcon ? iconShape : sharedClass,
    !isIcon && compactClass,
    department === "food"
      ? "bg-ink-900 text-surface-elevated hover:bg-ink-700 active:bg-ink-700"
      : "bg-primary text-surface-elevated hover:bg-primary-hover active:bg-primary-active",
    className
  )

  if (variants.length === 0 || (singleVariant && !isVariantPurchasable(singleVariant))) {
    return (
      <span
        className={clx("inline-flex items-center text-caption text-text-muted", className)}
        data-testid="product-unavailable-label"
      >
        Sold out
      </span>
    )
  }

  if (hasMultipleVariants) {
    return (
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className={variantClass}
        aria-label={isIcon ? `Choose options for ${product.title}` : undefined}
        data-testid="quick-add-select-options"
      >
        {isIcon ? (
          // An arrow, not a plus. A plus on a product with unchosen options
          // would promise an add that cannot happen without a size or
          // vintage — this control goes to the picker, and should look
          // like it does.
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5">
            <path
              d="M4 10h12m0 0-4.5-4.5M16 10l-4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          "Select options"
        )}
      </LocalizedClientLink>
    )
  }

  /**
   * Optimistic on purpose: the button confirms immediately on tap rather
   * than sitting on an "Adding…" pending label while the server round
   * trip completes, which read as sluggish on a real phone. The request
   * still runs, and a genuine failure rolls the label back to "Try
   * again" — so the only thing given up is the intermediate spinner
   * state, never the truth about whether the add actually succeeded.
   * The control also stays enabled throughout, so a second tap is never
   * swallowed by a disabled attribute.
   */
  const handleClick = async (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!singleVariant?.id) {
      return
    }

    setStatus("added")
    // Opened before the request resolves, so the drawer is already
    // sliding in as the customer lifts their finger — the cart it shows
    // fills in from the server a moment later.
    openDrawer()

    try {
      await addToCart({
        variantId: singleVariant.id,
        quantity: 1,
        countryCode,
      })
      window.setTimeout(() => setStatus("idle"), 2000)
    } catch {
      setStatus("error")
      window.setTimeout(() => setStatus("idle"), 2000)
    }
  }

  const label =
    status === "added"
      ? "Added ✓"
      : status === "error"
      ? "Try again"
      : "Add to cart"

  if (isIcon) {
    return (
      <button
        type="button"
        onClick={handleClick}
        data-testid="product-quick-add-button"
        className={variantClass}
        // The label carries the state as well as the name, so the change
        // from "add" to "added" is announced rather than being conveyed by
        // the glyph alone.
        aria-label={
          status === "added"
            ? `${product.title} added to cart`
            : status === "error"
            ? `Adding ${product.title} failed — try again`
            : `Add ${product.title} to cart`
        }
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5">
          {status === "added" ? (
            <path
              d="m5 10.5 3.2 3.2L15 6.8"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M10 4.5v11M4.5 10h11"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      data-testid="product-quick-add-button"
      className={variantClass}
    >
      {label}
    </button>
  )
}
