import { Metadata } from "next"
import FoodCentralMenuGrid from "@modules/food-central/components/menu-grid"

export const metadata: Metadata = {
  title: "Scheduled Orders | Food Central",
  description: "Schedule a Food Central order ahead of time.",
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function FoodCentralScheduledPage({ params }: Props) {
  const { countryCode } = await params

  return (
    <FoodCentralMenuGrid
      countryCode={countryCode}
      title="Scheduled Orders"
      description="Order from today's menu, then choose a future date and time at checkout."
    />
  )
}
