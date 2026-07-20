"use client"

import { addGiftWrapToLineItem, addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { isFoodCentralUnavailable } from "@lib/util/food-availability"
import { HttpTypes } from "@medusajs/types"
import { Button, Text } from "@modules/common/components/ui"
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

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
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

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)
    setConfirmation(null)

    try {
      const addedLineItem = await addToCart({
        variantId: selectedVariant.id,
        quantity,
        countryCode,
      })

      const giftWrapVariantId = giftWrapProduct?.variants?.[0]?.id
      if (giftWrapSelected && giftWrapVariantId && addedLineItem) {
        // §15 — metadata-linked to the product line it wraps, the same
        // convention the cart's own gift-wrap toggle uses, so a wrap
        // added here is recognized and grouped identically either way.
        await addGiftWrapToLineItem({
          giftWrapVariantId,
          forLineItemId: addedLineItem.id,
        })
      }

      // §18, §25 — immediate, persistent confirmation via both an inline
      // polite live region and a toast (DESIGN_SYSTEM.md §B9: a toast in
      // addition to inline confirmation, never a toast alone).
      const message = `Added ${quantity} × ${product.title} to your cart.`
      setConfirmation(message)
      showToast({ title: "Added to cart", description: product.title, variant: "success" })
    } catch {
      showToast({
        title: "Couldn't add to cart",
        description: "Please try again.",
        variant: "danger",
      })
    } finally {
      setIsAdding(false)
    }
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
                      disabled={!!disabled || isAdding}
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
            disabled={!!disabled || isAdding}
          />
        )}

        {!inStock && isValidVariant && (
          <Text size="caption" className="text-danger">
            {foodUnavailable
              ? "This dish is currently unavailable."
              : "This item is currently out of stock."}
          </Text>
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
            isAdding ||
            !isValidVariant
          }
          variant="primary"
          className="w-full h-10"
          isLoading={isAdding}
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
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}
