import { Text, clx } from "@modules/common/components/ui"
import { VariantPrice } from "types/global"

export default async function PreviewPrice({
  price,
  /**
   * Rendered on top of the product photo (over a dark gradient scrim)
   * rather than as a line of text below it — light type instead of the
   * usual ink tokens, since the ground behind it is the image.
   */
  overlay,
}: {
  price: VariantPrice
  overlay?: boolean
}) {
  if (!price) {
    return null
  }

  return (
    <>
      {price.price_type === "sale" && (
        <Text
          size="caption"
          className={clx(
            "line-through",
            overlay ? "text-on-scrim-muted" : "text-text-muted"
          )}
          data-testid="original-price"
        >
          {price.original_price}
        </Text>
      )}
      <Text
        className={clx("font-semibold", {
          "text-surface-elevated drop-shadow-sm": overlay,
          "text-text-primary": !overlay,
          "text-interactive": !overlay && price.price_type === "sale",
        })}
        data-testid="price"
      >
        {price.calculated_price}
      </Text>
    </>
  )
}
