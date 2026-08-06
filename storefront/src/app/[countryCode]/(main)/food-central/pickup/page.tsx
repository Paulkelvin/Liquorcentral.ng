import { Metadata } from "next"
import FoodCentralMenuGrid from "@modules/food-central/components/menu-grid"

export const metadata: Metadata = {
  title: "Pickup | Food Central",
  description: "Pick up a Food Central order in person.",
}

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function FoodCentralPickupPage({
  params,
  searchParams,
}: Props) {
  const { countryCode } = await params
  const { page } = await searchParams

  return (
    <FoodCentralMenuGrid
      countryCode={countryCode}
      title="Pickup"
      description="Order from today's menu, then choose pickup at checkout — with a clear ready-time estimate, equal weight to delivery."
      page={page ? parseInt(page) : 1}
    />
  )
}
