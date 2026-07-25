"use client"

import { ChevronDown } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import { useState } from "react"

type FooterCategoryChild = {
  id: string
  name: string
  handle: string
}

/**
 * A single Shop-column entry in the footer. A category that has
 * subcategories (Spirits → Whisky, Cognac, Vodka, …) collapses behind a
 * real disclosure rather than listing its whole subtree inline, which
 * otherwise made that one column many times taller than every other
 * group beside it.
 *
 * The category name stays an ordinary link to its own listing page — the
 * chevron beside it is a separate control, so collapsing never costs the
 * customer the ability to reach the parent category itself, and the
 * subcategory links remain real crawlable `<a href>`s once expanded
 * (01_NAVIGATION_SPECIFICATION.md §8/§26).
 */
export default function FooterCategoryGroup({
  id,
  name,
  handle,
  subcategories,
  linkClassName,
}: {
  id: string
  name: string
  handle: string
  subcategories: FooterCategoryChild[] | null
  linkClassName: string
}) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = !!subcategories?.length
  const panelId = `footer-subcategories-${id}`

  return (
    <li className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <LocalizedClientLink
          className={clx(linkClassName, hasChildren && "font-medium")}
          href={`/categories/${handle}`}
          data-testid="category-link"
        >
          {name}
        </LocalizedClientLink>
        {hasChildren && (
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={panelId}
            aria-label={`${expanded ? "Collapse" : "Expand"} ${name}`}
            onClick={() => setExpanded((v) => !v)}
            data-testid="footer-category-toggle"
            className="flex h-6 w-6 items-center justify-center rounded-radius-sm text-text-muted transition-colors duration-standard ease-in-out hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <ChevronDown
              className={clx(
                "transition-transform duration-150",
                expanded && "rotate-180"
              )}
            />
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <ul id={panelId} className="ml-3 grid grid-cols-1 gap-2">
          {subcategories!.map((child) => (
            <li key={child.id}>
              <LocalizedClientLink
                className={linkClassName}
                href={`/categories/${child.handle}`}
                data-testid="category-link"
              >
                {child.name}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
