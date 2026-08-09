"use client"

import { addToCart } from "@lib/data/cart"
import { useCart } from "@lib/context/cart-context"
import { demoImageFor } from "@lib/util/demo-product-images"
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
  "inline-flex items-center justify-center w-full min-h-[44px] py-2 px-4 text-[13px] font-medium rounded-radius-md border transition-colors duration-standard ease-in-out active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"

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
  size = "default",
}: {
  product: HttpTypes.StoreProduct
  className?: string
  department?: "wine" | "food"
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
  const { openDrawer, addItem } = useCart()
  const [status, setStatus] = useState<"idle" | "added" | "error">(
    "idle"
  )

  const variants = product.variants ?? []
  const singleVariant = variants.length === 1 ? variants[0] : undefined
  const hasMultipleVariants = variants.length > 1

  const isCompact = size === "compact"

  // `min-h-[38px]` needs no `!`: it is applied *after* `sharedClass` in the
  // same `clx` call, and `min-h-[44px]` there is the only competitor, so
  // Tailwind's emit order for two `min-h` arbitrary values is the tie —
  // which is exactly the kind of coin-flip this project has been bitten by
  // before. Hence the explicit `!` below rather than trusting it.
  const compactClass = isCompact
    ? "!min-h-[38px] py-1.5 before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-full before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] relative"
    : ""

  /**
   * **Outlined at rest, filled on hover and on confirmation.**
   *
   * This was a solid fill in both catalogs, and once every listing on the site
   * moved to the same grid card the result was a page of loud slabs: on a
   * twelve-card category grid the buttons were the first thing the eye landed
   * on, ahead of the products. Paul asked for them quieted.
   *
   * **Why an outline works where the old "secondary" fill did not.** §9
   * originally split these into primary and secondary *weights*, and that was
   * abandoned because the pale fill carrying the secondary half read as washed
   * out — i.e. as disabled. An outline is a different move: the label keeps
   * **full-strength** brand colour, so nothing about it reads as unavailable;
   * only the 40% of the card that was flat colour goes away. Do not "fix" this
   * by tinting the fill again.
   *
   * The catalogs stay distinguishable by hue, as before — Wine & Spirits in
   * the brand accent, Food Central in `ink-900` — now carried by the border
   * and the label rather than by a block of colour.
   *
   * **The confirmed and failed states stay solid**, deliberately. Quiet is
   * right for a control at rest and wrong for feedback: "Added" has to be
   * unmistakable at a glance, and a state change that only swaps a word inside
   * an outline is easy to miss on a phone. So the button fills in the moment
   * it has something to tell you, and empties again when it doesn't.
   *
   * Contrast holds in both states — the resting label is full-strength colour
   * on the page, the filled label is white on it — and the border clears
   * SC 1.4.11's 3:1 for a component boundary because it is the same colour as
   * the label. Verified with axe on `/`, `/store` and `/categories/spirits`.
   */
  /**
   * **Green, not red.** This button repeats once per card — a dozen times
   * on a listing screen — and in red it made Red the single most-repeated
   * colour on every shopping surface. `BRAND_IDENTITY.md` §13's usage
   * hierarchy (carried into `DESIGN_SYSTEM.md` §B6) puts Red at "5–10%,
   * reserved" and Green at "15–25%", and the implementation had it
   * backwards: Red on every card, Green nowhere but link text. Reserved
   * has to mean something — Red now marks the one primary action per
   * screen (the hero CTA, Go to checkout, Place order) rather than every
   * card in a grid.
   *
   * `interactive` rather than raw `secondary`: it is the green already
   * tuned for legibility on the page (Tier 3 derives it as a darkened
   * brand green precisely because brand green measured 3.74:1 on white).
   * The label at rest and white on the filled state both clear AA, and
   * the border matches the label so the boundary clears SC 1.4.11.
   *
   * Food Central keeps its ink treatment — the two departments read as
   * distinct on the homepage where both grids sit one above the other.
   */
  const isLoud = status !== "idle"
  const tone =
    department === "food"
      ? isLoud
        ? "border-ink-900 bg-ink-900 text-surface-elevated"
        : "border-ink-900 bg-transparent text-ink-900 hover:bg-ink-900 hover:text-surface-elevated active:bg-ink-700 active:border-ink-700"
      : isLoud
      ? "border-interactive bg-interactive text-surface-elevated"
      : "border-interactive bg-transparent text-interactive hover:bg-interactive hover:text-surface-elevated active:bg-interactive-active active:border-interactive-active"

  const variantClass = clx(sharedClass, compactClass, tone, className)

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
        data-testid="quick-add-select-options"
      >
        Select options
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
    // sliding in as the customer lifts their finger — the line item it
    // shows is optimistic too (built from data already on this card, no
    // fetch needed), and both settle against the server together.
    openDrawer()

    const unitPrice = singleVariant.calculated_price?.calculated_amount ?? 0
    const unitOriginalPrice =
      singleVariant.calculated_price?.original_amount ?? unitPrice

    // See product-actions' identical fix: an undefined `created_at`
    // sorted this line as the *oldest* item in every cart list, then it
    // jumped to wherever the real, freshly-timestamped item belongs once
    // the server settles — "now" up front means it's already there.
    const now = new Date().toISOString()

    const optimisticItem = {
      id: `optimistic-${singleVariant.id}-${Date.now()}`,
      quantity: 1,
      title: singleVariant.title ?? product.title,
      product_title: product.title,
      product_handle: product.handle,
      // demo-product-images.ts's own override — see product-actions'
      // identical fix for why the optimistic line needs it too.
      thumbnail: demoImageFor(product.handle)?.src ?? product.thumbnail,
      variant: singleVariant,
      // See product-actions' identical note — this is what keeps the row's
      // key (and so its photograph) stable across the optimistic→settled
      // swap.
      variant_id: singleVariant.id,
      unit_price: unitPrice,
      subtotal: unitPrice,
      total: unitPrice,
      original_total: unitOriginalPrice,
      created_at: now,
      updated_at: now,
    } as unknown as HttpTypes.StoreCartLineItem

    addItem(
      optimisticItem,
      () =>
        addToCart({
          variantId: singleVariant.id,
          quantity: 1,
          countryCode,
        }).then(() => {
          window.setTimeout(() => setStatus("idle"), 2000)
        }),
      () => {
        setStatus("error")
        window.setTimeout(() => setStatus("idle"), 2000)
      }
    )
  }

  const label =
    status === "added"
      ? "Added ✓"
      : status === "error"
      ? "Try again"
      : "Add to cart"

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
