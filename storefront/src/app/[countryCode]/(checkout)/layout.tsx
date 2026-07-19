import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-surface relative small:min-h-screen">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="h-16 bg-surface-elevated border-b border-border">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="text-small-semi text-text-primary flex items-center gap-x-2 uppercase flex-1 basis-0"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="mt-px hidden small:block txt-compact-plus text-text-secondary hover:text-text-primary">
              Back to shopping cart
            </span>
            <span className="mt-px block small:hidden txt-compact-plus text-text-secondary hover:text-text-primary">
              Back
            </span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="txt-compact-xlarge-plus text-text-secondary hover:text-text-primary uppercase"
            data-testid="store-link"
          >
            LiquorCentral
          </LocalizedClientLink>
          <div className="flex-1 basis-0" />
        </nav>
      </div>
      <main id="main-content" className="relative" data-testid="checkout-container">
        {children}
      </main>
    </div>
  )
}
