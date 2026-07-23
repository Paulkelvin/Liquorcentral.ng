"use client"

import { HttpTypes } from "@medusajs/types"

import Accordion from "./accordion"
import ProductFacts from "@modules/products/components/product-facts"
import TrustDeliveryInfo from "@modules/products/components/trust-delivery-info"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

/**
 * 05_PRODUCT_DETAILS_SPECIFICATION.md §7 (progressive disclosure), §13
 * ("the fact sheet is... reachable on the page, not hidden behind a page
 * navigation... that would remove it from the page's own scroll flow"),
 * §25 (an accessible disclosure pattern, `aria-expanded`-carrying trigger
 * controlling a content region). The underlying `Accordion` (Radix UI,
 * `type="multiple"`) already satisfies this: every section expands in
 * place, several can be open at once, and none of it navigates away from
 * the page — a disclosure widget, not a tab-switcher that would hide
 * other content. Only the *content* changed here: the vendored starter's
 * generic "Material/Country of origin/Weight" and fabricated "3-5
 * business days"/"no questions asked" copy (neither true of this
 * business — Food Central is same-day, and the alcohol return policy is
 * a genuinely open decision, not "no questions asked") is replaced with
 * real Wine/Food fact sheets (§10–§13) and honest, catalog-specific
 * trust/delivery information (§19–§21).
 */
const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Product details",
      component: <ProductFacts product={product} />,
    },
    {
      label: "Delivery & trust",
      component: <TrustDeliveryInfo product={product} />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

export default ProductTabs
