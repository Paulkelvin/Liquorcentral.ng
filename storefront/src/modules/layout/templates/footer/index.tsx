import { listCategories } from "@lib/data/categories";
import { listCollections } from "@lib/data/collections";
import { CheckCircleSolid } from "@medusajs/icons";
import { Text, clx } from "@modules/common/components/ui";

import LocalizedClientLink from "@modules/common/components/localized-client-link";

const FOOD_CENTRAL_LINKS = [
  { label: "Today's Menu", href: "/food-central" },
  { label: "Scheduled Orders", href: "/food-central/scheduled" },
  { label: "Pickup", href: "/food-central/pickup" },
];

const COMPANY_LINKS = [{ label: "About", href: "/about" }];
const SUPPORT_LINKS = [{ label: "Delivery & Returns", href: "/support" }];
const LEGAL_LINKS = [{ label: "Legal & Compliance", href: "/legal" }];

/** Shared heading for each footer link group — small, uppercase, tracked out. */
function GroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-caption font-medium uppercase tracking-wider text-text-on-inverse">
      {children}
    </span>
  );
}

const linkClass =
  "text-text-on-inverse-muted hover:text-text-on-inverse transition-colors duration-standard ease-in-out";

/**
 * 01_NAVIGATION_SPECIFICATION.md §8 — footer navigational content
 * structure: Shop (a secondary sitemap of the category tree, not a
 * duplicate mega menu — just crawlable links), Food Central (its own
 * short group, preserving equal prominence even in the footer), Company/
 * Trust, Support, Legal/Compliance. Every link is a real `<a href>`
 * (LocalizedClientLink → Next `<Link>`), never a JS-only handler (§21,
 * §26). Company/Support/Legal each point at a real, non-orphaned page
 * (§19, §24) rather than a redirect or 404 — their actual copy is
 * outside this specification's and this milestone's scope (brand/legal
 * content, not navigation structure).
 *
 * Laid out on an inverse (dark) ground: a wide brand/identity column
 * beside a block of uppercase-headed link groups, then a full-width
 * hairline with the primary call to action sitting *on* it at the far
 * right, then a quiet bottom bar. The reference this follows also
 * carries a social-icon row and a street address/phone/email block in
 * its left column; neither is reproduced here, because this project has
 * no real social accounts or company contact details — /about, /support
 * and /legal are themselves explicit placeholders for exactly that
 * still-open business content, so inventing an address or a handle to
 * fill the slot is not engineering's call. The column is populated with
 * what the platform genuinely has instead.
 */
export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  });
  const productCategories = await listCategories();

  const topLevelCategories = (productCategories ?? [])
    .filter((c) => !c.parent_category)
    .slice(0, 6);

  return (
    <footer className="w-full bg-surface-inverse text-text-on-inverse">
      <div className="ds-container flex w-full flex-col">
        <div className="grid grid-cols-1 gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-20">
          {/* Brand / identity column */}
          <div className="flex flex-col gap-y-5 lg:col-span-3">
            <LocalizedClientLink
              href="/"
              className="font-display text-heading-4 font-semibold tracking-tight text-text-on-inverse hover:opacity-80"
            >
              LiquorCentral
            </LocalizedClientLink>
            {/* `!` (important): Text hardcodes `text-text-primary` (ink-900)
                in its own class list, which on this inverse ground renders
                the copy invisibly dark-on-dark — Tailwind gives no
                source-order guarantee that a later className wins. */}
            <Text className="max-w-[260px] text-caption !text-text-on-inverse-muted">
              Premium wine, spirits, and Nigerian food — sold and delivered
              directly by us, never a stranger.
            </Text>
            <div className="flex flex-col gap-y-2 text-caption text-text-on-inverse-muted">
              <span className="flex items-center gap-1.5">
                <CheckCircleSolid className="shrink-0 text-secondary" />
                Sold &amp; delivered directly by LiquorCentral
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircleSolid className="shrink-0 text-secondary" />
                Secure payment
              </span>
            </div>
          </div>

          {/* Link groups */}
          <div className="grid grid-cols-2 gap-8 text-caption sm:grid-cols-3 lg:col-span-9 lg:grid-cols-5">
            {topLevelCategories.length > 0 && (
              <div className="flex flex-col gap-y-3">
                <GroupHeading>Shop</GroupHeading>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {topLevelCategories.map((c) => {
                    const children =
                      c.category_children?.map((child) => ({
                        name: child.name,
                        handle: child.handle,
                        id: child.id,
                      })) || null;

                    return (
                      <li className="flex flex-col gap-2" key={c.id}>
                        <LocalizedClientLink
                          className={clx(linkClass, children && "font-medium")}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="ml-3 grid grid-cols-1 gap-2">
                            {children.map((child) => (
                              <li key={child.id}>
                                <LocalizedClientLink
                                  className={linkClass}
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
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-y-3">
              <GroupHeading>Food Central</GroupHeading>
              <ul className="grid grid-cols-1 gap-2">
                {FOOD_CENTRAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <LocalizedClientLink
                      className={linkClass}
                      href={link.href}
                      data-testid="footer-link"
                    >
                      {link.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>

            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-3">
                <GroupHeading>Collections</GroupHeading>
                <ul className="grid grid-cols-1 gap-2">
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className={linkClass}
                        href={`/collections/${c.handle}`}
                        data-testid="footer-link"
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-y-3">
              <GroupHeading>Company</GroupHeading>
              <ul className="grid grid-cols-1 gap-2">
                {COMPANY_LINKS.map((link) => (
                  <li key={link.href}>
                    <LocalizedClientLink
                      className={linkClass}
                      href={link.href}
                      data-testid="footer-link"
                    >
                      {link.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-y-3">
              <GroupHeading>Support</GroupHeading>
              <ul className="grid grid-cols-1 gap-2">
                {SUPPORT_LINKS.map((link) => (
                  <li key={link.href}>
                    <LocalizedClientLink
                      className={linkClass}
                      href={link.href}
                      data-testid="footer-link"
                    >
                      {link.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Hairline with the call to action sitting on it, far right. The
            pill is 40px tall and pulled up by half that, so it stays
            centred on the rule at every width; the sections above and
            below reserve more than that in padding, so it never collides
            with their content. */}
        <div className="relative">
          <div className="h-px w-full bg-border-on-inverse" />
          <LocalizedClientLink
            href="/store"
            className="absolute right-0 -top-5 inline-flex h-10 items-center justify-center rounded-radius-full bg-surface-elevated px-5 text-caption font-medium text-ink-900 transition-colors duration-standard ease-in-out hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-on-inverse"
            data-testid="footer-cta"
          >
            Start shopping
          </LocalizedClientLink>
        </div>

        <div className="flex flex-col gap-y-4 pb-16 pt-10 text-caption text-text-on-inverse-muted sm:flex-row sm:items-center sm:justify-between">
          <Text className="text-caption !text-text-on-inverse-muted" as="span">
            © {new Date().getFullYear()} LiquorCentral. All rights reserved.
          </Text>
          <div className="flex flex-wrap gap-x-8 gap-y-2 uppercase tracking-wider">
            {LEGAL_LINKS.map((link) => (
              <LocalizedClientLink
                key={link.href}
                className={linkClass}
                href={link.href}
                data-testid="footer-link"
              >
                {link.label}
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
