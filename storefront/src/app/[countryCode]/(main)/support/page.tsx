import { Metadata } from "next"
import EmptyState from "@modules/common/components/empty-state"

export const metadata: Metadata = {
  title: "Support",
}

/**
 * Footer "Support" destination (01_NAVIGATION_SPECIFICATION.md §8:
 * delivery policy, returns). The alcohol-return policy and the
 * delivery-fee schedule are both still-open business decisions
 * (`BUSINESS_RULES.md`) this page cannot invent — a real, non-orphaned
 * placeholder in the meantime (§19, §24), not a redirect or 404.
 */
export default function SupportPage() {
  return (
    <div className="content-container py-16">
      <EmptyState
        title="Support"
        description="Delivery and returns information is coming soon."
      />
    </div>
  )
}
