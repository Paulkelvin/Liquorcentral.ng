import { Metadata } from "next"
import FoodCentralMenuGrid from "@modules/food-central/components/menu-grid"

export const metadata: Metadata = {
  title: "Today's Menu | Food Central",
  description: "Order fresh food for same-day delivery or pickup.",
}

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function FoodCentralTodaysMenuPage({
  params,
  searchParams,
}: Props) {
  const { countryCode } = await params
  const { page } = await searchParams

  return (
    <FoodCentralMenuGrid
      countryCode={countryCode}
      title="Today's Menu"
      description="Cooked to order. Same-day delivery or pickup, chosen at checkout."
      page={page ? parseInt(page) : 1}
    />
  )
}
