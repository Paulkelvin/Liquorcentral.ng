import CartTrigger from "../cart-trigger"

/**
 * The cart is fetched once in the (main) layout and handed to
 * `CartProvider`, so this no longer runs its own `retrieveCart()` — that
 * was a second request for a cart the layout had already loaded, and it
 * let the nav badge and the drawer disagree while an update was in
 * flight. Kept as a component so the nav's existing `<Suspense>`
 * boundary and import stay unchanged.
 */
export default function CartButton() {
  return <CartTrigger />
}
