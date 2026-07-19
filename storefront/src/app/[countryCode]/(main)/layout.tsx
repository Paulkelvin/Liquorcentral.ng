import { Metadata } from "next"
import { cookies } from "next/headers"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
import { StoreCartShippingOption } from "@medusajs/types"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"
import AgeGate from "@modules/home/components/age-gate"
import { AGE_GATE_COOKIE_NAME } from "@modules/home/components/age-gate/constants"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  const customer = await retrieveCustomer()
  const cart = await retrieveCart()
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
    <>
      {/* Skip-to-content link (DESIGN_SYSTEM.md §B11 / WCAG 2.4.1) —
          visually hidden until keyboard-focused. */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <AgeGate initiallyVerified={ageVerified} />
      <Nav />
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
      <Footer />
    </>
  )
}
