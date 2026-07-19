import { Metadata } from "next"
import EmptyState from "@modules/common/components/empty-state"

export const metadata: Metadata = {
  title: "About",
}

/**
 * Footer "Company/Trust" destination (01_NAVIGATION_SPECIFICATION.md
 * §8). Real brand/company copy (`PRODUCT_BLUEPRINT.md` §11's "legitimacy
 * content") is not this specification's or this milestone's to write —
 * this is a real, non-invented, non-orphaned placeholder page (§19,
 * §24), not a redirect or a 404, so the footer link is never a dead end.
 */
export default function AboutPage() {
  return (
    <div className="content-container py-16">
      <EmptyState
        title="About LiquorCentral"
        description="This page is coming soon."
      />
    </div>
  )
}
