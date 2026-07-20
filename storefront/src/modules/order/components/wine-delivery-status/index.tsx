import { HttpTypes } from "@medusajs/types"
import { Heading, clx } from "@modules/common/components/ui"
import {
  WineDeliveryStage,
  WINE_DELIVERY_STAGES,
  wineDeliveryStageLabel,
  getWineDeliveryStage,
  hasWineSpiritsItems,
} from "@lib/util/wine-delivery-status"

/**
 * 10_DELIVERY_SPECIFICATION.md §10 — Wine & Spirits' own nationwide-dispatch
 * progression, specified for the first time by that document: Order Placed
 * -> Dispatched -> In Transit -> Delivered, no stage skipped or shown out
 * of order. Renders only when the order genuinely contains a Wine &
 * Spirits item AND a stage has actually been set by staff
 * (`wine-delivery-status-widget.tsx`) — mirrors `FoodOrderStatus`'s
 * identical "never fabricate a stage" discipline exactly.
 *
 * `heading` lets a caller rendering both catalogs' statuses side by side
 * (§15 — "never merged into one status") give this block its own
 * catalog-labeled heading instead of the generic "Order status" default.
 */
export default function WineDeliveryStatus({
  order,
  heading = "Order status",
}: {
  order: HttpTypes.StoreOrder
  heading?: string
}) {
  const stage = getWineDeliveryStage(order)
  const containsWine = hasWineSpiritsItems(order)

  if (!containsWine || !stage) {
    return null
  }

  const displayStages = WINE_DELIVERY_STAGES as readonly WineDeliveryStage[]
  const currentIndex = displayStages.indexOf(stage)

  return (
    <div className="flex flex-col gap-y-4" data-testid="wine-delivery-status">
      <Heading level="h2" className="txt-large">
        {heading}
      </Heading>
      <ol className="flex flex-col gap-y-2">
        {displayStages.map((s, index) => {
          const isCurrent = index === currentIndex
          const isComplete = index < currentIndex
          return (
            <li
              key={s}
              className={clx("flex items-center gap-x-2 txt-compact-small", {
                "text-text-primary font-medium": isCurrent,
                "text-text-secondary": isComplete,
                "text-text-disabled": index > currentIndex,
              })}
            >
              <span aria-hidden="true">{isCurrent || isComplete ? "●" : "○"}</span>
              {wineDeliveryStageLabel(s)}
              {isCurrent && <span className="sr-only"> (current stage)</span>}
            </li>
          )
        })}
      </ol>
      <div role="status" aria-live="polite" className="sr-only">
        {`${heading}: ${wineDeliveryStageLabel(stage)}`}
      </div>
    </div>
  )
}
