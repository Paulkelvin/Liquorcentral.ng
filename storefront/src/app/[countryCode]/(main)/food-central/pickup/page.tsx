import { Metadata } from "next"
import NotTakingOrders from "@modules/food-central/components/not-taking-orders"

export const metadata: Metadata = {
  title: "Pickup | Food Central",
  description: "Pick up a Food Central order in person.",
}

export default function FoodCentralPickupPage() {
  return <NotTakingOrders title="Pickup" />
}
