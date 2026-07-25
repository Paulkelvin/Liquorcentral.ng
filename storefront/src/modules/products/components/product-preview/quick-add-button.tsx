"use client"

import { addToCart } from "@lib/data/cart"
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
}: {
  product: HttpTypes.StoreProduct
  className?: string
  department?: "wine" | "food"
}) {
  const countryCode = useParams().countryCode as string
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
  const variantClass = clx(
    sharedClass,
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
