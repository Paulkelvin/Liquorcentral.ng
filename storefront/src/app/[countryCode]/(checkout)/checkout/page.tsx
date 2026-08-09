import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getVariantInventoryMap } from "@lib/data/products"
import { isFoodCentralItem, isStockManaged } from "@lib/util/cart-fulfillment"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
  // 07_CHECKOUT_SPECIFICATION.md §25 — customer-specific, session-bound,
  // same treatment as the cart (06_CART_SPECIFICATION.md §25).
  robots: {
    index: false,
    follow: false,
  },
}

/**
 * §5, §8, §15 — the fulfillment-group grouping (Order Summary, the
 * eligibility conflict check) and the age-verification restatement all
 * depend on `food_details`/`wine_details`, which `retrieveCart`'s default
 * fields string doesn't request (it replaces rather than merges with a
 * caller-supplied string) — the same additive field-string requirement
 * `06_CART_SPECIFICATION.md`'s own cart page already established.
 */
const CHECKOUT_CART_FIELDS =
  "*items, *region, *items.product, +items.product.food_details.*, +items.product.wine_details.*, *items.variant, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name"

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function Checkout({ params }: Props) {
  const { countryCode } = await params
  const cart = await retrieveCart(undefined, CHECKOUT_CART_FIELDS)

  // §4, §19 — checkout is unreachable with an empty cart or an unresolved
  // blocking condition (a zero-purchasable line item) — both return the
  // customer to the cart with the condition still visible, per
  // `06_CART_SPECIFICATION.md` §20's own empty state and §12/§13's
  // unavailable-item labeling, never a broken or partially-rendered
  // checkout.
  //
  // **No cart at all takes the same path as an empty one.** This used to
  // `notFound()`, which was wrong on both counts: the route plainly
  // exists, so "not found" is the wrong answer semantically, and it
  // dead-ends the customer on a 404 instead of the cart's own empty
  // state. It was also reachable by an ordinary action rather than a
  // contrived one — `placeOrder` deliberately clears the cart cookie
  // before redirecting to the confirmation page, so pressing **Back**
  // after completing an order landed on `/checkout` with no cart and
  // showed a 404 immediately after a successful purchase. A missing
  // cart and an emptied cart are the same situation to a customer
  // ("there is nothing to check out"), so they get the same answer.
  if (!cart?.items?.length) {
    redirect(`/${countryCode}/cart`)
  }

  const stockManagedItems = cart.items.filter(
    (item) => !isFoodCentralItem(item) && isStockManaged(item)
  )
  if (stockManagedItems.length) {
    const stockByVariantId = await getVariantInventoryMap(
      stockManagedItems.map((item) => item.product_id).filter((id): id is string => !!id),
      countryCode
    )
    const hasBlockingCondition = stockManagedItems.some(
      (item) => item.variant_id && stockByVariantId[item.variant_id] === 0
    )
    if (hasBlockingCondition) {
      redirect(`/${countryCode}/cart`)
    }
  }

  const customer = await retrieveCustomer()

  // The (checkout) route group has no CartProvider (deliberately — see
  // cart-context.tsx's own note), so the summary can't read the flat
  // delivery rate from context the way the drawer/cart page do; fetched
  // directly here instead. Cheap and already cached — the same call the
  // `(main)` layout makes for FreeShippingPriceNudge, just for this route
  // group's own request. Paul: "on the checkout page... so that users are
  // notified that this is the exact amount they are going to be paying
  // for delivery" — needs to show before Contact is even submitted, not
  // only once shipping_methods is populated.
  const { shipping_options: shippingOptions } = await listCartOptions()
  const standardDeliveryFee = shippingOptions[0]?.amount ?? null

  return (
    // 160px of gutter left the form and the summary reading as two
    // unrelated pages; 48px keeps them as one layout.
    <div className="grid grid-cols-1 small:grid-cols-[1fr_400px] ds-container gap-x-12 gap-y-8 py-8 small:py-12">
      <PaymentWrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} />
      </PaymentWrapper>
      <CheckoutSummary cart={cart} knownDeliveryFee={standardDeliveryFee} />
    </div>
  )
}
