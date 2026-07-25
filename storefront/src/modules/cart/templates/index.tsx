import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Heading, Text } from "@modules/common/components/ui"
import { HttpTypes } from "@medusajs/types"

/**
 * Two panels side by side on desktop — the line items on the left, a
 * sticky order summary on the right — collapsing to a single stacked
 * column on mobile, with the summary following the items so the
 * customer reads what they are buying before what it costs. Each panel
 * is its own bordered, rounded surface rather than bare content on the
 * page, so the two read as distinct areas of the task.
 */
const CartTemplate = ({
  cart,
  customer,
  giftWrap,
  stockByVariantId,
  notices,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  giftWrap?: { variantId: string; price: number }
  stockByVariantId?: Record<string, number>
  /** §13, §19 — a stock auto-adjustment since add-to-cart, explained plainly, never silent. */
  notices?: string[]
}) => {
  const itemCount =
    cart?.items?.reduce((total, item) => total + item.quantity, 0) ?? 0

  return (
    <div className="py-8 small:py-12">
      <div className="ds-container" data-testid="cart-container">
        {notices && notices.length > 0 && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 flex flex-col gap-y-2 rounded-radius-sm border border-warning bg-warning-tint p-4 text-caption text-text-primary"
            data-testid="cart-notices"
          >
            {notices.map((notice, index) => (
              <p key={index}>{notice}</p>
            ))}
          </div>
        )}
        {cart?.items?.length ? (
          <div className="grid grid-cols-1 items-start gap-6 small:grid-cols-[minmax(0,1fr)_380px] small:gap-8">
            <div className="flex flex-col gap-6 rounded-radius-md border border-border bg-surface-elevated p-4 small:p-6">
              {/* Panel header: what this page is, and a way back out of
                  it that isn't the browser's back button. */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <Heading level="h1" className="!text-heading-3">
                    Your cart
                  </Heading>
                  <Text size="caption" muted>
                    Check everything over before you head to checkout.
                  </Text>
                </div>
                <LocalizedClientLink
                  href="/store"
                  className="hidden shrink-0 items-center rounded-radius-full border border-border px-4 py-2 text-caption font-medium text-text-primary transition-colors duration-standard ease-in-out hover:bg-ink-100 xsmall:inline-flex"
                  data-testid="continue-shopping-top"
                >
                  Continue shopping
                </LocalizedClientLink>
              </div>

              {!customer && (
                <>
                  <SignInPrompt />
                  <Divider />
                </>
              )}
              <ItemsTemplate
                cart={cart}
                giftWrap={giftWrap}
                stockByVariantId={stockByVariantId}
              />
            </div>

            <div className="small:sticky small:top-24">
              {cart && cart.region && (
                <Summary cart={cart} itemCount={itemCount} />
              )}
            </div>
          </div>
        ) : (
          <div>
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
