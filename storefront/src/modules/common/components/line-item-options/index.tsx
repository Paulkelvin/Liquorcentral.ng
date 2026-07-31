import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"

type LineItemOptionsProps = {
  variant: HttpTypes.StoreProductVariant | undefined
  /**
   * Whether to prefix the variant with the word "Variant:".
   *
   * **Defaults to `false` now.** It previously defaulted to `true` and the
   * cart drawer opted out; Paul then asked for the prefix gone from the
   * cart entirely, so the default is inverted rather than adding a second
   * opt-out. "750ml" reads faster than "Variant: 750ml", and directly under
   * a product title the word restates what the position already says.
   *
   * The prop survives because the order-confirmation line item still passes
   * `true`: an order record is a document a customer may need to reason
   * about long after the fact, and there the label is doing real work
   * naming what the value is.
   */
  showLabel?: boolean
  "data-testid"?: string
  "data-value"?: HttpTypes.StoreProductVariant
}

const LineItemOptions = ({
  variant,
  showLabel = false,
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
