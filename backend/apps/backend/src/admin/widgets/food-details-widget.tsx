import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Button,
  Checkbox,
  Container,
  Heading,
  Input,
  Label,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect, FormEvent } from "react"
import { sdk } from "../lib/sdk"

/**
 * Shown on every product's detail page, same reasoning as
 * wine-details-widget.tsx — no native "product line" field to gate on.
 * Staff leave every field blank for a non-Food-Central product.
 *
 * Ingredients/allergens/dietary flags are entered as comma-separated text
 * and split into arrays on save — a lightweight form choice, not an
 * architectural one; the underlying field remains a real array
 * (TIER_B_FOOD_ATTRIBUTES_MODULE.md §6's Composition/Safety-critical
 * categories), this is purely how the widget collects it.
 */

type FoodDetailsFormState = {
  ingredients: string
  allergens: string
  dietaryFlags: string
  safetyDataVerified: boolean
  spiceLevel: string
  prepTimeMinutes: string
  portionSize: string
}

const EMPTY_FORM: FoodDetailsFormState = {
  ingredients: "",
  allergens: "",
  dietaryFlags: "",
  safetyDataVerified: false,
  spiceLevel: "",
  prepTimeMinutes: "",
  portionSize: "",
}

type FoodDetailsQueryResult = {
  product: AdminProduct & {
    food_details?: {
      id: string
      ingredients: string[] | null
      allergens: string[] | null
      dietary_flags: string[] | null
      safety_data_verified: boolean
      spice_level: number | null
      prep_time_minutes: number | null
      portion_size: string | null
    } | null
  }
}

const listToText = (list: string[] | null | undefined) =>
  list && list.length > 0 ? list.join(", ") : ""

const textToList = (text: string): string[] =>
  text
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

const FoodDetailsWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FoodDetailsFormState>(EMPTY_FORM)

  const { data: queryResult, isLoading } = useQuery({
    queryKey: ["product", data.id, "food_details"],
    queryFn: () =>
      sdk.client.fetch<FoodDetailsQueryResult>(
        `/admin/products/${data.id}`,
        { query: { fields: "id,+food_details.*" } }
      ),
  })

  useEffect(() => {
    const foodDetails = queryResult?.product.food_details
    if (!foodDetails) {
      setForm(EMPTY_FORM)
      return
    }

    setForm({
      ingredients: listToText(foodDetails.ingredients),
      allergens: listToText(foodDetails.allergens),
      dietaryFlags: listToText(foodDetails.dietary_flags),
      safetyDataVerified: foodDetails.safety_data_verified,
      spiceLevel: foodDetails.spice_level?.toString() ?? "",
      prepTimeMinutes: foodDetails.prep_time_minutes?.toString() ?? "",
      portionSize: foodDetails.portion_size ?? "",
    })
  }, [queryResult])

  const { mutateAsync, isPending } = useMutation({
    mutationFn: () =>
      sdk.admin.product.update(data.id, {
        // @ts-expect-error additional_data is accepted by the endpoint
        // (src/api/middlewares.ts validates it) but isn't part of the
        // SDK's own generated request type.
        additional_data: {
          ingredients:
            form.ingredients === "" ? null : textToList(form.ingredients),
          allergens:
            form.allergens === "" ? null : textToList(form.allergens),
          dietary_flags:
            form.dietaryFlags === "" ? null : textToList(form.dietaryFlags),
          safety_data_verified: form.safetyDataVerified,
          spice_level:
            form.spiceLevel === "" ? null : Number(form.spiceLevel),
          prep_time_minutes:
            form.prepTimeMinutes === ""
              ? null
              : Number(form.prepTimeMinutes),
          portion_size: form.portionSize === "" ? null : form.portionSize,
        },
      }),
    onSuccess: () => {
      toast.success("Food Central details saved")
      queryClient.invalidateQueries({
        queryKey: ["product", data.id, "food_details"],
      })
    },
    onError: (error: Error) => {
      toast.error("Could not save Food Central details", {
        description: error.message,
      })
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    mutateAsync()
  }

  const handleChange =
    (field: keyof Omit<FoodDetailsFormState, "safetyDataVerified">) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }))
    }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Food Central Details</Heading>
      </div>
      <form onSubmit={handleSubmit} className="px-6 py-4">
        <Text size="small" className="text-ui-fg-subtle mb-4">
          Structured facts for Food Central dishes only. Leave every field
          blank for a Wine &amp; Spirits product — nothing is required.
          Ingredients, allergens, and dietary flags are comma-separated.
        </Text>
        {isLoading ? (
          <Text size="small">Loading...</Text>
        ) : (
          <div className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-2">
              <Label size="small">Ingredients</Label>
              <Textarea
                value={form.ingredients}
                onChange={handleChange("ingredients")}
                rows={2}
                placeholder="e.g. rice, tomato stew, chicken, plantain"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-y-2">
                <Label size="small">Allergens</Label>
                <Input
                  value={form.allergens}
                  onChange={handleChange("allergens")}
                  placeholder="e.g. peanuts, dairy — leave blank if not yet verified"
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label size="small">Dietary flags</Label>
                <Input
                  value={form.dietaryFlags}
                  onChange={handleChange("dietaryFlags")}
                  placeholder="e.g. halal, vegan"
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label size="small">Spice level (scale)</Label>
                <Input
                  type="number"
                  value={form.spiceLevel}
                  onChange={handleChange("spiceLevel")}
                  placeholder="e.g. 0-4"
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label size="small">Prep time (minutes)</Label>
                <Input
                  type="number"
                  value={form.prepTimeMinutes}
                  onChange={handleChange("prepTimeMinutes")}
                  placeholder="e.g. 25"
                />
              </div>
              <div className="col-span-2 flex flex-col gap-y-2">
                <Label size="small">Portion size</Label>
                <Input
                  value={form.portionSize}
                  onChange={handleChange("portionSize")}
                  placeholder="e.g. Serves 1"
                />
              </div>
            </div>
            <div className="flex items-center gap-x-2 pt-2">
              <Checkbox
                id="safety_data_verified"
                checked={form.safetyDataVerified}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({
                    ...prev,
                    safetyDataVerified: checked === true,
                  }))
                }
              />
              <Label size="small" htmlFor="safety_data_verified">
                Allergen and dietary data verified for this dish
              </Label>
            </div>
          </div>
        )}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            variant="secondary"
            size="small"
            isLoading={isPending}
            disabled={isLoading}
          >
            Save
          </Button>
        </div>
      </form>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default FoodDetailsWidget
