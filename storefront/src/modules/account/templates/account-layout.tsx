import React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  /**
   * Signed out, this route is a single centred sign-in panel — so it gets
   * none of the dashboard chrome: no account sidebar (which otherwise
   * reserved an empty 240px column and pushed the form off to one side),
   * and no elevated page-wide surface competing with the panel's own.
   * The sign-in template owns its full-bleed backdrop from here.
   */
  if (!customer) {
    return (
      <div className="flex-1" data-testid="account-page">
        {children}
      </div>
    )
  }

  return (
    <div className="flex-1 small:py-12" data-testid="account-page">
      <div className="flex-1 ds-container h-full max-w-5xl mx-auto bg-surface-elevated flex flex-col">
        <div className="grid grid-cols-1  small:grid-cols-[240px_1fr] py-12">
          <div>
            <AccountNav customer={customer} />
          </div>
          <div className="flex-1">{children}</div>
        </div>
        <div className="flex flex-col small:flex-row items-end justify-between small:border-t border-divider py-12 gap-8">
          <div>
            {/* A real page.tsx <h1> (or Login's own) is the only heading
                above this in the DOM — <h2> is the correct next level,
                found via a live axe-core `heading-order` scan that had
                never touched a rendered account page before. */}
            <h2 className="text-heading-3 font-semibold mb-4">Got questions?</h2>
            <span className="txt-medium">
              You can find frequently asked questions and answers on our
              customer service page.
            </span>
          </div>
          <div>
            {/* /customer-service has never existed in this app's route
                tree — this link resolved to a 404. /support is the real
                delivery-and-returns destination the footer already uses. */}
            <UnderlineLink href="/support">Customer Service</UnderlineLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
