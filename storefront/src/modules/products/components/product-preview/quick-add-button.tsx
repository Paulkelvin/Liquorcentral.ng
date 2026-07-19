"use client"

import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
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
  "inline-flex items-center justify-center min-h-[44px] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"

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
 * `weight` controls visual weight only (§9's Food Central-primary /
 * Wine-secondary distinction), never whether the control exists or is
 * reachable — both weights stay in the DOM and keyboard/touch-operable at
 * all times (§14/§24: hover-only reveal is never the sole way to reach an
 * action).
 */
export default function QuickAddButton({
  product,
  weight,
}: {
  product: HttpTypes.StoreProduct
  weight: "primary" | "secondary"
}) {
  const countryCode = useParams().countryCode as string
  const [status, setStatus] = useState<"idle" | "adding" | "added" | "error">(
    "idle"
  )

  const variants = product.variants ?? []
  const singleVariant = variants.length === 1 ? variants[0] : undefined
  const hasMultipleVariants = variants.length > 1

  const primaryClass = `${sharedClass} w-full px-4 py-2 rounded-radius-md font-medium border border-border text-text-primary hover:bg-surface-elevated`
  const secondaryClass = `${sharedClass} px-2 text-caption text-text-primary underline hover:text-interactive`
  const variantClass = weight === "primary" ? primaryClass : secondaryClass

  if (variants.length === 0 || (singleVariant && !isVariantPurchasable(singleVariant))) {
    return (
      <span className="inline-flex items-center text-caption text-text-muted" data-testid="product-unavailable-label">
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

  const handleClick = async (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!singleVariant?.id) {
      return
    }

    setStatus("adding")

    try {
      await addToCart({
        variantId: singleVariant.id,
        quantity: 1,
        countryCode,
      })
      setStatus("added")
      window.setTimeout(() => setStatus("idle"), 2000)
    } catch {
      setStatus("error")
      window.setTimeout(() => setStatus("idle"), 2000)
    }
  }

  const label =
    status === "adding"
      ? "Adding…"
      : status === "added"
      ? "Added ✓"
      : status === "error"
      ? "Try again"
      : "Add to cart"

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "adding"}
      data-testid="product-quick-add-button"
      className={variantClass}
    >
      {label}
    </button>
  )
}
