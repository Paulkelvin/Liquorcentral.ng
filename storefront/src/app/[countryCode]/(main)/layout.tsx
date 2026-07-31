import { Metadata } from "next"
import { cookies } from "next/headers"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
import { StoreCartShippingOption } from "@medusajs/types"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import CartDrawer from "@modules/layout/components/cart-drawer"
import { CartProvider } from "@lib/context/cart-context"
import Footer from "@modules/layout/templates/footer"
import TrustBand from "@modules/layout/components/trust-band"
import Nav from "@modules/layout/templates/nav"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"
import AgeGate from "@modules/home/components/age-gate"
import { AGE_GATE_COOKIE_NAME } from "@modules/home/components/age-gate/constants"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

/**
 * The drawer groups its lines by fulfillment leg (§5/§6), which needs the
 * linked-module fields. `retrieveCart`'s own default field string
 * replaces rather than merges with anything passed in, so the full set
 * has to be spelled out here — the same requirement the cart and
 * checkout pages already document.
 */
const LAYOUT_CART_FIELDS =
  "*items, *region, *items.product, +items.product.food_details.*, +items.product.wine_details.*, *items.variant, *items.thumbnail, *items.metadata, +items.total, +item_subtotal, *promotions, +shipping_methods.name"

export default async function PageLayout(props: { children: React.ReactNode }) {
  const customer = await retrieveCustomer()
  const cart = await retrieveCart(undefined, LAYOUT_CART_FIELDS)
  let shippingOptions: StoreCartShippingOption[] = []

  if (cart) {
    const { shipping_options } = await listCartOptions()

    shippingOptions = shipping_options
  }

  // 02_HOMEPAGE_SPECIFICATION.md §24 assumes a site-wide gate on first
  // visit (the simpler, conservative default) — mounted here, in the
  // shared (main) layout, rather than only on the homepage, so a visitor
  // landing directly on a category or product page is gated too.
  const cookieStore = await cookies()
  const ageVerified = cookieStore.get(AGE_GATE_COOKIE_NAME)?.value === "true"

  return (
    // Above the nav on purpose: the cart badge, the drawer and every
    // add-to-cart button on the page below all read from this one
    // provider, so they can never disagree about what is in the cart.
    <CartProvider initialCart={cart}>
      {/* Skip-to-content link (DESIGN_SYSTEM.md §B11 / WCAG 2.4.1) —
          visually hidden until keyboard-focused. */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <AgeGate initiallyVerified={ageVerified} />
      <Nav />
      <CartDrawer />
      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {cart && (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart}
          shippingOptions={shippingOptions}
        />
      )}
      <main id="main-content">{props.children}</main>
      {/* Directly above the footer, on every page in this layout — not
          only the homepage, where it used to live. */}
      <TrustBand />
      <Footer />
    </CartProvider>
  )
}
