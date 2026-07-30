import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"

type LineItemOptionsProps = {
  variant: HttpTypes.StoreProductVariant | undefined
  /**
   * Whether to prefix the variant with the word "Variant:". Defaults to
   * true, which is what the order-confirmation and cart-page line items
   * have always rendered — those sit in denser tables of mixed
   * information where the label genuinely disambiguates.
   *
   * The cart drawer passes `false`: directly under the product title, in
   * a panel showing nothing but cart lines, "Variant: 750ml" spends a
   * word restating what the position already makes obvious, and the bottle
   * size reads faster on its own. Deliberately opt-out rather than a
   * global change, so the two other surfaces stay exactly as approved.
   */
  showLabel?: boolean
  "data-testid"?: string
  "data-value"?: HttpTypes.StoreProductVariant
}

const LineItemOptions = ({
  variant,
  showLabel = true,
  "data-testid": dataTestid,
  "data-value": dataValue,
}: LineItemOptionsProps) => {
  return (
    <Text
      data-testid={dataTestid}
      data-value={dataValue}
      className="inline-block txt-medium text-text-secondary w-full overflow-hidden text-ellipsis"
    >
      {showLabel ? `Variant: ${variant?.title}` : variant?.title}
    </Text>
  )
}

export default LineItemOptions
