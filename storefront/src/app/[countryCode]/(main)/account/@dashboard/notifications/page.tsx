import { Metadata } from "next"
import { notFound } from "next/navigation"

import NotificationPreferences from "@modules/account/components/notification-preferences"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Notification preferences",
  description: "Manage how you hear about your orders.",
  robots: { index: false, follow: false },
}

export default async function NotificationsPage() {
  const customer = await retrieveCustomer()

  if (!customer) {
    notFound()
  }

  return <NotificationPreferences />
}
