import { Metadata } from "next"
import { notFound } from "next/navigation"

import PrivacySecurity from "@modules/account/components/privacy-security"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Privacy & security",
  description: "View your data and manage your account.",
  robots: { index: false, follow: false },
}

export default async function PrivacyPage() {
  const customer = await retrieveCustomer()

  if (!customer) {
    notFound()
  }

  return <PrivacySecurity customer={customer} />
}
