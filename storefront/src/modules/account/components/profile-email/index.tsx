import { Text } from "@modules/common/components/ui"
import { HttpTypes } from "@medusajs/types"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

/**
 * 08_CUSTOMER_ACCOUNT_SPECIFICATION.md §11 — "changing the email requires
 * re-verification of the new address before it becomes the account's
 * primary contact." Investigated whether this could be built against
 * native Medusa Auth: the `emailpass` auth provider's own `update()` method
 * (`@medusajs/auth-emailpass`) only ever reads a `password` field from its
 * input — it has no code path that renames an auth identity's `entity_id`
 * (the email a customer actually logs in with). Calling the Customer
 * module's own `update` with a new `email` only changes the *Customer
 * record's* displayed email, leaving the *login* identity silently pointed
 * at the old address — a real, confusing mismatch, not a cosmetic one.
 * Rather than ship a "change email" control that quietly breaks a
 * customer's ability to log in, email is shown read-only here; changing it
 * needs backend work (a mechanism to rename or re-link an auth identity)
 * this milestone doesn't invent. Flagged in DECISION_LOG.md.
 */
const ProfileEmail: React.FC<MyInformationProps> = ({ customer }) => {
  return (
    <div className="text-small-regular" data-testid="account-email-editor">
      <div className="flex flex-col">
        <span className="uppercase text-ui-fg-base">Email</span>
        <span className="font-semibold" data-testid="current-info">
          {customer.email}
        </span>
      </div>
      <Text className="text-ui-fg-subtle mt-2">
        Changing your email address isn&apos;t supported yet — please contact
        us if you need this address updated.
      </Text>
    </div>
  )
}

export default ProfileEmail
