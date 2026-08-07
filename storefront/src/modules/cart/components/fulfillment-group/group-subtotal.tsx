"use client"

import { convertToLocale } from "@lib/util/money"
import { useOptionalCart } from "@lib/context/cart-context"
import { Text, clx } from "@modules/common/components/ui"

/**
 * Split out from `FulfillmentGroup` itself so that component can stay a
 * plain Server Component — it's handed `getMaxQuantity`/`isItemUnavailable`
 * callback props from `items.tsx`, and a Server→Client boundary can't
 * carry a function across it ("Functions cannot be passed directly to
 * Client Components" — hit this directly trying to make the whole group
 * client-side). Only the few pixels that actually need `useOptionalCart`
 * cross that boundary.
 *
 * Same treatment as `CartTotals`'s own subtotal: this figure is computed
 * server-side from the raw cart (`groupSubtotal` in `items.tsx`), so it
 * lags a full round trip behind a quantity tap. Dimming it during that
 * window is the "still calculating" signal that was missing (Paul: "it
 * doesn't calculate the price quickly... look into the architecture") —
 * the number itself was never slow, it just gave no indication it was
 * about to change.
 */
export default function GroupSubtotal({
  amount,
  currencyCode,
}: {
  amount: number
  currencyCode: string
}) {
  const isPending = useOptionalCart()?.isPending ?? false

  return (
    <Text
      className={clx(
        "txt-medium-plus text-text-primary transition-opacity duration-standard",
        isPending && "opacity-50"
      )}
      data-testid="cart-fulfillment-group-subtotal"
      data-value={amount}
    >
      {convertToLocale({ amount, currency_code: currencyCode })}
    </Text>
  )
}
