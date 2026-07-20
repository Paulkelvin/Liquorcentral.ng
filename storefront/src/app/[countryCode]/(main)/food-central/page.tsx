import { Metadata } from "next"
import FoodCentralMenuGrid from "@modules/food-central/components/menu-grid"

export const metadata: Metadata = {
  title: "Today's Menu | Food Central",
  description: "Order fresh food for same-day delivery or pickup.",
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function FoodCentralTodaysMenuPage({ params }: Props) {
  const { countryCode } = await params

  return (
    <FoodCentralMenuGrid
      countryCode={countryCode}
      title="Today's Menu"
      description="Cooked to order. Same-day delivery or pickup, chosen at checkout."
    />
  )
}
