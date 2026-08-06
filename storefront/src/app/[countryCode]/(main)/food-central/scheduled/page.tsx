import { Metadata } from "next"
import FoodCentralMenuGrid from "@modules/food-central/components/menu-grid"

export const metadata: Metadata = {
  title: "Scheduled Orders | Food Central",
  description: "Schedule a Food Central order ahead of time.",
}

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function FoodCentralScheduledPage({
  params,
  searchParams,
}: Props) {
  const { countryCode } = await params
  const { page } = await searchParams

  return (
    <FoodCentralMenuGrid
      countryCode={countryCode}
      title="Scheduled Orders"
      description="Order from today's menu, then choose a future date and time at checkout."
      page={page ? parseInt(page) : 1}
    />
  )
}
