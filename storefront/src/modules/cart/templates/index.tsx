import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

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
  return (
    <div className="py-12">
      <div className="content-container" data-testid="cart-container">
        {notices && notices.length > 0 && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 flex flex-col gap-y-2 rounded-radius-sm border border-warning bg-warning-tint p-4 text-small-regular text-text-primary"
            data-testid="cart-notices"
          >
            {notices.map((notice, index) => (
              <p key={index}>{notice}</p>
            ))}
          </div>
        )}
        {cart?.items?.length ? (
          <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] gap-x-40">
            <div className="flex flex-col bg-white py-6 gap-y-6">
              {!customer && (
                <>
                  <SignInPrompt />
                  <Divider />
                </>
              )}
              <ItemsTemplate cart={cart} giftWrap={giftWrap} stockByVariantId={stockByVariantId} />
            </div>
            <div className="relative">
              <div className="flex flex-col gap-y-8 sticky top-12">
                {cart && cart.region && (
                  <>
                    <div className="bg-white py-6">
                      <Summary cart={cart} />
                    </div>
                  </>
                )}
              </div>
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
