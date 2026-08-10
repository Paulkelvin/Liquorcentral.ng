import { WhatsAppIcon } from "@modules/layout/templates/footer/social-icons"

/**
 * The site's WhatsApp number, per Paul's direct instruction — the same
 * number shown on the brand's own Instagram bio
 * (instagram.com/foodandliquorcentral.ng). `wa.me` wants the number
 * digits-only (country code, no leading `+`, no spaces/dashes).
 */
const WHATSAPP_NUMBER = "2348169804932"
const WHATSAPP_GREETING = "Hi! I have a question about LiquorCentral."
const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_GREETING
)}`

/**
 * A persistent chat entry point, fixed to the bottom-right corner of
 * every (main)-layout page — mounted once here rather than per-page, the
 * same pattern as `ScrollToTop`/`CartDrawer` in that layout.
 *
 * **`z-40`, deliberately below the mobile sticky Add to Cart bar's
 * `z-50`** (`product-actions/mobile-actions.tsx`). That bar is
 * full-width and only appears once a shopper has scrolled past the real
 * action row on a product page — letting it simply cover this button
 * while it's showing (rather than layering the two, which would either
 * block part of the Add to Cart bar or look like two competing floating
 * controls stacked on each other) is a one-line fix that needs no
 * cross-component coordination. It reappears the instant the bar hides.
 *
 * Excluded from checkout for free: this only mounts in the `(main)`
 * route group's layout, which checkout (`(checkout)`) isn't part of —
 * matching the ordinary pattern of not distracting a shopper mid-payment.
 */
export default function WhatsAppFloat() {
  return (
    <a
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-radius-full bg-[#25D366] text-white shadow-elevation-3 transition-transform duration-standard ease-in-out hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
      style={{
        bottom: "max(1.25rem, calc(env(safe-area-inset-bottom) + 0.75rem))",
      }}
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  )
}
