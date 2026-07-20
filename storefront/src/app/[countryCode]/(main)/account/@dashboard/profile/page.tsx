import { Metadata } from "next"

import ProfilePhone from "@modules/account//components/profile-phone"
import ProfileEmail from "@modules/account/components/profile-email"
import ProfileName from "@modules/account/components/profile-name"
import ProfilePassword from "@modules/account/components/profile-password"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Profile",
  description: "View and edit your LiquorCentral profile.",
  robots: { index: false, follow: false },
}

/**
 * 08_CUSTOMER_ACCOUNT_SPECIFICATION.md §5 — Profile covers name, email,
 * phone, and password (§11); it does not include a separate "billing
 * address" section — that was a vendored apparel-store artifact
 * duplicating this platform's own unified Saved Addresses concept (§12),
 * now consolidated into the Addresses page's own default-address marking
 * instead. See DECISION_LOG.md.
 */
export default async function Profile() {
  const customer = await retrieveCustomer()

  if (!customer) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="profile-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Profile</h1>
        <p className="text-base-regular">
          View and update your profile information, including your name and
          phone number, and change your password.
        </p>
      </div>
      <div className="flex flex-col gap-y-8 w-full">
        <ProfileName customer={customer} />
        <Divider />
        <ProfileEmail customer={customer} />
        <Divider />
        <ProfilePhone customer={customer} />
        <Divider />
        <ProfilePassword customer={customer} />
      </div>
    </div>
  )
}

const Divider = () => {
  return <div className="w-full h-px bg-gray-200" />
}
