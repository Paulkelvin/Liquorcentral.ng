import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Button,
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
 * Shown on every product's detail page — there is no native "product
 * line" field to gate this on (Wine & Spirits vs. Food Central is a
 * Category concern per INFORMATION_ARCHITECTURE.md, and category-tree
 * content is itself still an open decision). Staff simply leave every
 * field blank for a non-Wine & Spirits product, consistent with
 * TIER_B_WINE_ATTRIBUTES_MODULE.md §3's tolerance for inapplicability.
 *
 * Values are persisted through the native product update endpoint's
 * `additional_data` extension point, not a custom route — see
 * src/api/middlewares.ts and src/workflows/wine-details.
 */

type WineDetailsFormState = {
  vintage: string
  producer: string
  region: string
  bottle_size: string
  tasting_notes: string
  serving_temperature: string
  abv: string
}

const EMPTY_FORM: WineDetailsFormState = {
  vintage: "",
  producer: "",
  region: "",
  bottle_size: "",
  tasting_notes: "",
  serving_temperature: "",
  abv: "",
}

type WineDetailsQueryResult = {
  product: AdminProduct & {
    wine_details?: {
      id: string
      vintage: number | null
      producer: string | null
      region: string | null
      bottle_size: string | null
      tasting_notes: string | null
      serving_temperature: string | null
      abv: number | null
    } | null
  }
}

const WineDetailsWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<WineDetailsFormState>(EMPTY_FORM)

  const { data: queryResult, isLoading } = useQuery({
    queryKey: ["product", data.id, "wine_details"],
    queryFn: () =>
      sdk.client.fetch<WineDetailsQueryResult>(
        `/admin/products/${data.id}`,
        { query: { fields: "id,+wine_details.*" } }
      ),
  })

  useEffect(() => {
    const wineDetails = queryResult?.product.wine_details
    if (!wineDetails) {
      setForm(EMPTY_FORM)
      return
    }

    setForm({
      vintage: wineDetails.vintage?.toString() ?? "",
      producer: wineDetails.producer ?? "",
      region: wineDetails.region ?? "",
      bottle_size: wineDetails.bottle_size ?? "",
      tasting_notes: wineDetails.tasting_notes ?? "",
      serving_temperature: wineDetails.serving_temperature ?? "",
      abv: wineDetails.abv?.toString() ?? "",
    })
  }, [queryResult])

  const { mutateAsync, isPending } = useMutation({
    mutationFn: () =>
      sdk.admin.product.update(data.id, {
        // @ts-expect-error additional_data is accepted by the endpoint
        // (src/api/middlewares.ts validates it) but isn't part of the
        // SDK's own generated request type.
        additional_data: {
          vintage: form.vintage === "" ? null : Number(form.vintage),
          producer: form.producer === "" ? null : form.producer,
          region: form.region === "" ? null : form.region,
          bottle_size: form.bottle_size === "" ? null : form.bottle_size,
          tasting_notes:
            form.tasting_notes === "" ? null : form.tasting_notes,
          serving_temperature:
            form.serving_temperature === ""
              ? null
              : form.serving_temperature,
          abv: form.abv === "" ? null : Number(form.abv),
        },
      }),
    onSuccess: () => {
      toast.success("Wine & Spirits details saved")
      queryClient.invalidateQueries({
        queryKey: ["product", data.id, "wine_details"],
      })
    },
    onError: (error: Error) => {
      toast.error("Could not save Wine & Spirits details", {
        description: error.message,
      })
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    mutateAsync()
  }

  const handleChange =
    (field: keyof WineDetailsFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }))
    }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Wine & Spirits Details</Heading>
      </div>
      <form onSubmit={handleSubmit} className="px-6 py-4">
        <Text size="small" className="text-ui-fg-subtle mb-4">
          Structured facts for Wine &amp; Spirits products only. Leave every
          field blank for a Food Central product — nothing is required.
        </Text>
        {isLoading ? (
          <Text size="small">Loading...</Text>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-y-2">
              <Label size="small">Vintage</Label>
              <Input
                type="number"
                value={form.vintage}
                onChange={handleChange("vintage")}
                placeholder="e.g. 2019 (omit for non-vintage)"
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label size="small">ABV (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={form.abv}
                onChange={handleChange("abv")}
                placeholder="e.g. 13.5"
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label size="small">Winery / producer</Label>
              <Input
                value={form.producer}
                onChange={handleChange("producer")}
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label size="small">Country of origin / region</Label>
              <Input value={form.region} onChange={handleChange("region")} />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label size="small">Bottle size</Label>
              <Input
                value={form.bottle_size}
                onChange={handleChange("bottle_size")}
                placeholder="e.g. 750ml"
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label size="small">Serving temperature</Label>
              <Input
                value={form.serving_temperature}
                onChange={handleChange("serving_temperature")}
                placeholder="e.g. Chilled, 8–10°C"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-y-2">
              <Label size="small">Tasting notes</Label>
              <Textarea
                value={form.tasting_notes}
                onChange={handleChange("tasting_notes")}
                rows={3}
              />
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

export default WineDetailsWidget
