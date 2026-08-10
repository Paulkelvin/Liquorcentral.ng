import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Switch, Text, toast } from "@medusajs/ui"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { sdk } from "../lib/sdk"

/**
 * Which fulfillment channel(s) a dish is offered through — Pickup and
 * Scheduled Orders used to show the identical menu on the storefront
 * (Paul noticed and asked for a real per-dish split: some dishes are
 * ready fast enough for pickup, others genuinely need the lead time
 * scheduling gives a kitchen). Same reasoning as
 * `food-availability-widget.tsx`'s own `food_available` flag: two simple
 * booleans on Product's own native `metadata`
 * (`food_pickup_available`/`food_scheduled_available`), not a
 * `food-details` field or a new module — no migration required, and it
 * mirrors the storefront's own `food-availability.ts` field names
 * exactly.
 *
 * Both default **on** — an unedited dish (including every dish that
 * existed before this widget did) keeps appearing on both Pickup and
 * Scheduled Orders exactly as before, until someone deliberately
 * narrows a specific dish here.
 */
type FoodFulfillmentQueryResult = {
  product: AdminProduct & {
    metadata?: Record<string, unknown> | null
  }
}

const FoodFulfillmentWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const queryClient = useQueryClient()
  const [pickupAvailable, setPickupAvailable] = useState(true)
  const [scheduledAvailable, setScheduledAvailable] = useState(true)

  const { data: queryResult, isLoading } = useQuery({
    queryKey: ["product", data.id, "food_fulfillment"],
    queryFn: () =>
      sdk.client.fetch<FoodFulfillmentQueryResult>(
        `/admin/products/${data.id}`,
        { query: { fields: "id,metadata" } }
      ),
  })

  const existingMetadata = queryResult?.product.metadata ?? {}

  useEffect(() => {
    const metadata = queryResult?.product.metadata ?? {}
    setPickupAvailable(metadata.food_pickup_available !== false)
    setScheduledAvailable(metadata.food_scheduled_available !== false)
  }, [queryResult])

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (metadata: Record<string, unknown>) =>
      sdk.admin.product.update(data.id, {
        metadata: { ...existingMetadata, ...metadata },
      }),
    onSuccess: () => {
      toast.success("Food Central fulfillment saved")
      queryClient.invalidateQueries({
        queryKey: ["product", data.id, "food_fulfillment"],
      })
    },
    onError: (error: Error) => {
      toast.error("Could not save fulfillment channels", {
        description: error.message,
      })
    },
  })

  const handlePickupToggle = (checked: boolean) => {
    setPickupAvailable(checked)
    mutateAsync({ food_pickup_available: checked })
  }

  const handleScheduledToggle = (checked: boolean) => {
    setScheduledAvailable(checked)
    mutateAsync({ food_scheduled_available: checked })
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Food Central Fulfillment</Heading>
      </div>
      <div className="px-6 py-4">
        <Text size="small" className="text-ui-fg-subtle mb-4">
          Only meaningful for Food Central dishes — leave both on (the
          default) for Wine &amp; Spirits products. Turn a channel off if
          this specific dish shouldn&rsquo;t be offered through it — e.g. a
          slow-cook dish that only makes sense as a Scheduled Order, or a
          quick dish that&rsquo;s always ready for Pickup.
        </Text>
        {isLoading ? (
          <Text size="small">Loading...</Text>
        ) : (
          <div className="flex flex-col gap-y-4">
            <div className="flex items-center gap-x-3">
              <Switch
                id="food_pickup_available"
                checked={pickupAvailable}
                onCheckedChange={handlePickupToggle}
                disabled={isPending}
              />
              <Text size="small">
                Pickup {pickupAvailable ? "— offered" : "— not offered"}
              </Text>
            </div>
            <div className="flex items-center gap-x-3">
              <Switch
                id="food_scheduled_available"
                checked={scheduledAvailable}
                onCheckedChange={handleScheduledToggle}
                disabled={isPending}
              />
              <Text size="small">
                Scheduled Orders{" "}
                {scheduledAvailable ? "— offered" : "— not offered"}
              </Text>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default FoodFulfillmentWidget
