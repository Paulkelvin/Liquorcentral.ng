import { Metadata } from "next"
import NotTakingOrders from "@modules/food-central/components/not-taking-orders"

export const metadata: Metadata = {
  title: "Today's Menu | Food Central",
  description: "Order fresh food for same-day delivery or pickup.",
}

export default function FoodCentralTodaysMenuPage() {
  return <NotTakingOrders title="Today's Menu" />
}
