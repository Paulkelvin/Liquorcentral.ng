"use client"

import { addGiftWrapToLineItem, addToCart } from "@lib/data/cart"
import { useCart } from "@lib/context/cart-context"
import { useIntersection } from "@lib/hooks/use-in-view"
import { demoImageFor } from "@lib/util/demo-product-images"
import { isFoodCentralUnavailable } from "@lib/util/food-availability"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import QuantityStepper from "@modules/products/components/quantity-stepper"
import GiftWrapAddon from "@modules/products/components/gift-wrap-addon"
import { useToast } from "@modules/common/components/toast"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { useRouter } from "next/navigation"

type ProductWithCatalogDetails = HttpTypes.StoreProduct & {
  food_details?: unknown
}

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
  giftWrapProduct?: HttpTypes.StoreProduct | null
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  region,
  disabled,
  giftWrapProduct,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { showToast } = useToast()

  const { openDrawer, addItem } = useCart()
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [quantity, setQuantity] = useState(1)
  const [giftWrapSelected, setGiftWrapSelected] = useState(false)
  const [confirmation, setConfirmation] = useState<string | null>(null)
  const countryCode = useParams().countryCode as string

  // 05_PRODUCT_DETAILS_SPECIFICATION.md §17 — Food Central quantity is not
  // capped by a stock number invented at the PDP level (inventory tracking
  // is off, made-to-order); only Wine & Spirits is genuinely stock-capped.
  const isFoodCentral = !!(product as ProductWithCatalogDetails).food_details

  // 09_FOOD_ORDERING_SPECIFICATION.md §6, §16 — the "Unavailable" (86'd)
  // state, distinct from Wine & Spirits' stock-based out-of-stock check
  // below.
  const foodUnavailable = isFoodCentralUnavailable(
    product as ProductWithCatalogDetails
  )

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    router.replace(pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // 09_FOOD_ORDERING_SPECIFICATION.md §6, §16 — a dish flagged
    // Unavailable can't be added regardless of the (untracked) variant.
    if (foodUnavailable) {
      return false
    }

    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant, foodUnavailable])

  // §17 — genuine available stock caps the stepper for Wine & Spirits only.
  const maxQuantity =
    !isFoodCentral &&
    selectedVariant?.manage_inventory &&
    !selectedVariant?.allow_backorder
      ? selectedVariant?.inventory_quantity || 0
      : undefined

  useEffect(() => {
    setQuantity(1)
  }, [selectedVariant?.id])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  /**
   * `useIntersection` reports whether `actionsRef` is *currently*
   * on-screen — true both after scrolling past it and before ever
   * reaching it. On a phone, the gallery image alone often fills the
   * first screen, so the real inline price/quantity/add-to-cart row
   * starts below the fold: `inView` is `false` from the very first
   * frame, and the sticky mobile bar (below) used to read that as
   * "scrolled past," showing immediately on load — Paul's own
   * description, a customer landing on the page and immediately being
   * pushed toward Add to Cart before they've seen anything else. Gating
   * on `hasBeenInView` as well means the sticky bar only appears once
   * the real action row has actually been seen and then left upward.
   */
  const hasBeenInViewRef = useRef(false)
  if (inView) {
    hasBeenInViewRef.current = true
  }

  /**
   * **Optimistic, matching `QuickAddButton`'s own fix for the same
   * complaint on the listing cards.** This used to `await` the full
   * server round trip with the button disabled and reading "Loading…"
   * the whole time — on a real connection to the Medusa backend that
   * read as sluggish, and Paul said so plainly: "I don't want to see
   * loading... the plus button should add immediately." The confirmation
   * and the drawer now both fire the instant the tap lands; the request
   * still runs behind them, and a genuine failure rolls the confirmation
   * back and toasts instead of silently succeeding. The one thing this
   * gives up is the intermediate spinner state, never the truth about
   * whether the add actually worked.
   *
   * **The drawer's contents are optimistic too, not just its open state.**
   * Opening the drawer used to be the only optimistic part — the line
   * item itself only appeared once `addToCart`'s `revalidateTag` round-
   * tripped a fresh server cart back down, which on a real connection to
   * the backend was a visible beat of the drawer showing the cart it had
   * *before* this tap. `addItem` paints a synthetic line (built from data
   * already on this page — no fetch needed) into the optimistic cart the
   * same instant the drawer opens; the real `addToCart` call replaces it
   * with the authoritative line once it resolves.
   */
  const handleAddToCart = () => {
    if (!selectedVariant?.id) return

    setConfirmation(`Added ${quantity} × ${product.title} to your cart.`)
    // Opened before the request resolves, so the drawer is already
    // sliding in as the customer lifts their finger — the item it shows
    // is optimistic too (below), and both settle against the server
    // together.
    openDrawer()

    const unitPrice = selectedVariant.calculated_price?.calculated_amount ?? 0
    const unitOriginalPrice =
      selectedVariant.calculated_price?.original_amount ?? unitPrice

    // A real timestamp, not left undefined — every cart list (drawer,
    // /cart page, checkout summary) sorts by `created_at` to keep items
    // in a fixed order, and an undefined value was sorting as the
    // *oldest* possible item (empty string), landing this line at the
    // opposite end from where the real server item lands once it
    // settles a moment later. That end-to-end jump is the "added item
    // jumps around" bug — giving it "now" up front means it's already
    // sitting where the settled item will be.
    const now = new Date().toISOString()

    const optimisticItem = {
      id: `optimistic-${selectedVariant.id}-${Date.now()}`,
      quantity,
      title: selectedVariant.title ?? product.title,
      product_title: product.title,
      product_handle: product.handle,
      // demo-product-images.ts's own override — without this the
      // optimistic line flashed the real (currently mismatched-brand)
      // `product.thumbnail` for a moment before settling on the demo
      // image the cart-item components apply once the server cart lands.
      thumbnail: demoImageFor(product.handle)?.src ?? product.thumbnail,
      variant: selectedVariant,
      // Explicit, not just left to `variant.id`: every cart list keys its
      // rows off this (see cart-drawer's own note), and the settled
      // server line carries it — so without it here the row would be
      // keyed on the throwaway `optimistic-…` id, remount on settle, and
      // visibly re-load its photograph.
      variant_id: selectedVariant.id,
      unit_price: unitPrice,
      subtotal: unitPrice * quantity,
      total: unitPrice * quantity,
      original_total: unitOriginalPrice * quantity,
      created_at: now,
      updated_at: now,
    } as unknown as HttpTypes.StoreCartLineItem

    addItem(
      optimisticItem,
      () =>
        addToCart({
          variantId: selectedVariant.id,
          quantity,
          countryCode,
        }).then((addedLineItem) => {
          const giftWrapVariantId = giftWrapProduct?.variants?.[0]?.id
          if (giftWrapSelected && giftWrapVariantId && addedLineItem) {
            // §15 — metadata-linked to the product line it wraps, the
            // same convention the cart's own gift-wrap toggle uses, so a
            // wrap added here is recognized and grouped identically
            // either way.
            return addGiftWrapToLineItem({
              giftWrapVariantId,
              forLineItemId: addedLineItem.id,
            })
          }
        }),
      () => {
        setConfirmation(null)
        showToast({
          title: "Couldn't add to cart",
          description: "Please try again.",
          variant: "danger",
        })
      }
    )
  }

  return (
    <>
      <div className="flex flex-col gap-y-4" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        <ProductPrice product={product} variant={selectedVariant} />

        {selectedVariant && (
          <QuantityStepper
            quantity={quantity}
            onChange={setQuantity}
            max={maxQuantity}
            disabled={!!disabled}
          />
        )}

        {giftWrapProduct?.variants?.[0] && (
          <GiftWrapAddon
            price={giftWrapProduct.variants[0].calculated_price?.calculated_amount ?? 0}
            currencyCode={region.currency_code}
            checked={giftWrapSelected}
            onChange={setGiftWrapSelected}
          />
        )}

        <Button
          onClick={handleAddToCart}
          disabled={
            !inStock ||
            !selectedVariant ||
            !!disabled ||
            !isValidVariant
          }
          variant="primary"
          className="w-full h-10"
          data-testid="add-product-button"
        >
          {!selectedVariant && !options
            ? "Select variant"
            : foodUnavailable
            ? "Unavailable"
            : !inStock || !isValidVariant
            ? "Out of stock"
            : "Add to cart"}
        </Button>
        {/* §18, §25 — a polite live region announces add-to-cart success
            to assistive technology, independent of the toast above. */}
        <div role="status" aria-live="polite" className="sr-only">
          {confirmation}
        </div>
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          show={hasBeenInViewRef.current && !inView}
          optionsDisabled={!!disabled}
        />
      </div>
    </>
  )
}
