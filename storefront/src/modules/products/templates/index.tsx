import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import TrustAndDelivery from "@modules/products/components/trust-and-delivery"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import Breadcrumbs from "@modules/common/components/breadcrumbs"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductWithCatalogDetails = HttpTypes.StoreProduct & {
  food_details?: unknown
}

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

/**
 * 05_PRODUCT_DETAILS_SPECIFICATION.md §5's information architecture,
 * implemented as this page's literal section order: (1) the "buy" section
 * — gallery, name, price, availability, quantity, add-to-cart; (2)
 * structured facts (`ProductTabs`, §10/§11 via §13); (3) related products
 * (§15 — "pairs with", §14, is correctly absent, since its backend
 * relationship remains unscoped, `MEDUSA_EXTENSIONS.md`); (4) trust and
 * delivery context (§19–§21), present on every PDP, not assumed already
 * seen elsewhere (§4). Reviews (§22) are correctly absent — no review
 * system exists in v1.
 */
const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const category = product.categories?.[0]
  const isFoodCentral = !!(product as ProductWithCatalogDetails).food_details

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? undefined,
    image: product.thumbnail ?? undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: region.currency_code.toUpperCase(),
      price:
        (product.variants?.[0]?.calculated_price?.calculated_amount ?? 0) /
        100,
      availability: product.variants?.some(
        (v) => !v.manage_inventory || (v.inventory_quantity ?? 0) > 0 || v.allow_backorder
      )
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  }

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Food Central's navigation is deliberately not category-driven
          (`food-central-menu/index.tsx`'s own comment — no Product
          Category models "Food Central", its destinations are the
          dedicated `/food-central` route tree instead), so a Food
          Central PDP's middle crumb links there directly. Wine & Spirits
          has no single unifying root category either (the seeded tree is
          flat top-level categories — Wines, Spirits, Beer, etc. — per
          `navigation-category-seed.ts`), so its middle crumb links to the
          all-products listing rather than a nonexistent category. */}
      <Breadcrumbs
        segments={[
          { label: "Home", href: "/" },
          {
            label: isFoodCentral ? "Food Central" : "Wine & Spirits",
            href: isFoodCentral ? "/food-central" : "/store",
          },
          ...(category
            ? [{ label: category.name, href: `/categories/${category.handle}` }]
            : []),
          { label: product.title },
        ]}
      />
      <div
        className="content-container  flex flex-col small:flex-row small:items-start py-6 relative"
        data-testid="product-container"
      >
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-6">
          <ProductInfo product={product} />
          <ProductTabs product={product} />
        </div>
        <div className="block w-full relative">
          <ImageGallery images={images} title={product.title ?? ""} />
        </div>
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-12">
          <ProductOnboardingCta />
          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={product}
                region={region}
              />
            }
          >
            <ProductActionsWrapper
              id={product.id}
              region={region}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
      <div className="content-container mb-16 max-w-2xl">
        <TrustAndDelivery isFoodCentral={isFoodCentral} />
      </div>
    </>
  )
}

export default ProductTemplate
