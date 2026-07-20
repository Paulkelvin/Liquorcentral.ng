import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Switch, Text, toast } from "@medusajs/ui"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { sdk } from "../lib/sdk"

/**
 * 09_FOOD_ORDERING_SPECIFICATION.md §6, §16 — the "Unavailable" (86'd)
 * dish state. Deliberately not a field on the `food-details` module
 * (TIER_B_FOOD_ATTRIBUTES_MODULE.md §4/§5 explicitly excludes live
 * availability state from that module) and not a new module either —
 * this is one boolean, so it's stored on Product's own native
 * `metadata` field (`food_available`) via the ordinary
 * `POST /admin/products/:id` endpoint, no `additional_data` plumbing or
 * migration required. Shown on every product's detail page, same
 * unconditional-visibility reasoning as `food-details-widget.tsx` — a
 * Wine & Spirits product simply leaves this at its default (Available).
 *
 * Only the binary Available/Unavailable state is implemented here.
 * "Available to schedule" (the spec's third state) is not — it depends
 * on same-day cutoff timing and delivery-slot storefront wiring that
 * are both explicitly "not yet built" per §25's Backend Requirements
 * table, not something a toggle widget can honestly add on its own.
 */
type FoodAvailabilityQueryResult = {
  product: AdminProduct & {
    metadata?: Record<string, unknown> | null
  }
}

const FoodAvailabilityWidget = ({
  data,
}: DetailWidgetProps<AdminProduct>) => {
  const queryClient = useQueryClient()
  const [isAvailable, setIsAvailable] = useState(true)

  const { data: queryResult, isLoading } = useQuery({
    queryKey: ["product", data.id, "food_available"],
    queryFn: () =>
      sdk.client.fetch<FoodAvailabilityQueryResult>(
        `/admin/products/${data.id}`,
        { query: { fields: "id,metadata" } }
      ),
  })

  const existingMetadata = queryResult?.product.metadata ?? {}

  useEffect(() => {
    const metadata = queryResult?.product.metadata ?? {}
    setIsAvailable(metadata.food_available !== false)
  }, [queryResult])

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (nextAvailable: boolean) =>
      sdk.admin.product.update(data.id, {
        metadata: { ...existingMetadata, food_available: nextAvailable },
      }),
    onSuccess: () => {
      toast.success("Food Central availability saved")
      queryClient.invalidateQueries({
        queryKey: ["product", data.id, "food_available"],
      })
    },
    onError: (error: Error) => {
      toast.error("Could not save availability", {
        description: error.message,
      })
    },
  })

  const handleToggle = (checked: boolean) => {
    setIsAvailable(checked)
    mutateAsync(checked)
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Food Central Availability</Heading>
      </div>
      <div className="px-6 py-4">
        <Text size="small" className="text-ui-fg-subtle mb-4">
          Only meaningful for Food Central dishes — leave the default
          (Available) for Wine &amp; Spirits products. Turn this off to mark
          a dish 86&rsquo;d (an ingredient shortage or similar) — it stays
          visible on the menu, labeled Unavailable, rather than disappearing.
        </Text>
        {isLoading ? (
          <Text size="small">Loading...</Text>
        ) : (
          <div className="flex items-center gap-x-3">
            <Switch
              id="food_available"
              checked={isAvailable}
              onCheckedChange={handleToggle}
              disabled={isPending}
            />
            <Text size="small">
              {isAvailable ? "Available" : "Unavailable"}
            </Text>
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default FoodAvailabilityWidget
