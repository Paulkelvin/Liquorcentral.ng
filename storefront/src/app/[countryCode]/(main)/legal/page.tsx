import { Metadata } from "next"
import EmptyState from "@modules/common/components/empty-state"

export const metadata: Metadata = {
  title: "Legal",
}

/**
 * Footer "Legal/Compliance" destination (01_NAVIGATION_SPECIFICATION.md
 * §8). Legal/compliance copy requires Legal/Business sign-off per the
 * spec's own Governance table — not engineering's to draft. A real,
 * non-orphaned placeholder (§19, §24), not a redirect or 404.
 */
export default function LegalPage() {
  return (
    <div className="content-container py-16">
      <EmptyState
        title="Legal & Compliance"
        description="This page is coming soon."
      />
    </div>
  )
}
