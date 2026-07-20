import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
// TODO: Re-add Toaster component when needed
import AccountLayout from "@modules/account/templates/account-layout"

// 08_CUSTOMER_ACCOUNT_SPECIFICATION.md §24 — every account page is
// customer-specific and authentication-gated; none is indexed. A
// layout-level fallback for the whole account route tree, in addition to
// the noindex each individual page already sets explicitly.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  const customer = await retrieveCustomer().catch(() => null)

  return (
    <AccountLayout customer={customer}>
      {customer ? dashboard : login}
      {/* TODO: Re-add Toaster component when needed */}
    </AccountLayout>
  )
}
