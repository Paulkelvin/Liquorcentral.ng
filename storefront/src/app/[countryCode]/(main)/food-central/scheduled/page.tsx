import { Metadata } from "next"
import NotTakingOrders from "@modules/food-central/components/not-taking-orders"

export const metadata: Metadata = {
  title: "Scheduled Orders | Food Central",
  description: "Schedule a Food Central order ahead of time.",
}

export default function FoodCentralScheduledPage() {
  return <NotTakingOrders title="Scheduled Orders" />
}
