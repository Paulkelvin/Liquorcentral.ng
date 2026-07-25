import { listCategories } from "@lib/data/categories";
import { listCollections } from "@lib/data/collections";
import { CheckCircleSolid } from "@medusajs/icons";
import { Text } from "@modules/common/components/ui";

import LocalizedClientLink from "@modules/common/components/localized-client-link";
import FooterCategoryGroup from "@modules/layout/components/footer-category-group";
import {
  InstagramIcon,
  TikTokIcon,
  WhatsAppIcon,
  YouTubeIcon,
} from "./social-icons";

const FOOD_CENTRAL_LINKS = [
  { label: "Today's Menu", href: "/food-central" },
  { label: "Scheduled Orders", href: "/food-central/scheduled" },
  { label: "Pickup", href: "/food-central/pickup" },
];

const COMPANY_LINKS = [{ label: "About", href: "/about" }];
const SUPPORT_LINKS = [{ label: "Delivery & Returns", href: "/support" }];
const LEGAL_LINKS = [{ label: "Legal & Compliance", href: "/legal" }];

/**
 * ⚠️ The four platforms here are the ones chosen for the storefront, but
 * the real account URLs are not known to this codebase — no handle,
 * profile link, or social account appears anywhere in the repo or the
 * specs. Fill each `href` in below and the icon becomes a real link
 * automatically; until then each renders as a non-interactive mark and
 * is skipped by assistive technology, because pointing a customer at a
 * guessed URL risks sending them to an unrelated (or impersonating)
 * account, which is worse than not linking at all.
 */
const SOCIAL_LINKS: { label: string; href: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "Instagram", href: "", Icon: InstagramIcon },
  { label: "WhatsApp", href: "", Icon: WhatsAppIcon },
  { label: "TikTok", href: "", Icon: TikTokIcon },
  { label: "YouTube", href: "", Icon: YouTubeIcon },
];

const socialButtonClass =
  "flex h-11 w-11 items-center justify-center rounded-radius-full border border-border text-text-secondary transition-colors duration-standard ease-in-out";

/** Shared heading for each footer link group — small, uppercase, tracked out. */
function GroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-caption font-medium uppercase tracking-wider text-text-primary">
      {children}
    </span>
  );
}

const linkClass =
  "text-text-secondary hover:text-text-primary transition-colors duration-standard ease-in-out";

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
 * Layout follows the referenced footer's *structure* only — a brand and
 * identity column beside uppercase-headed link groups, a full-width
 * hairline with the primary call to action sitting on it at the far
 * right, then a quiet bottom bar — while the surface, type and accent
 * colours stay this design system's own. Everything is a single stacked
 * column on mobile.
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
    <footer className="w-full border-t border-border">
      <div className="ds-container flex w-full flex-col">
        <div className="grid grid-cols-1 gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-20">
          {/* Brand / identity column */}
          <div className="flex flex-col gap-y-5 lg:col-span-3">
            <LocalizedClientLink
              href="/"
              className="font-display text-heading-4 font-semibold tracking-tight text-text-primary hover:text-interactive"
            >
              LiquorCentral
            </LocalizedClientLink>
            <Text className="max-w-[280px] text-caption" muted>
              Premium wine, spirits, and Nigerian food — sold and delivered
              directly by us, never a stranger.
            </Text>

            <ul className="flex flex-wrap items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <li key={label}>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`LiquorCentral on ${label}`}
                      className={`${socialButtonClass} hover:border-text-primary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus`}
                    >
                      <Icon />
                    </a>
                  ) : (
                    <span className={socialButtonClass} aria-hidden="true">
                      <Icon />
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-y-2 text-caption text-text-muted">
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

          {/* Link groups — one stacked column on mobile, per direct feedback */}
          <div className="grid grid-cols-1 gap-8 text-caption sm:grid-cols-3 lg:col-span-9 lg:grid-cols-5">
            {topLevelCategories.length > 0 && (
              <div className="flex flex-col gap-y-3">
                <GroupHeading>Shop</GroupHeading>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {topLevelCategories.map((c) => (
                    <FooterCategoryGroup
                      key={c.id}
                      id={c.id}
                      name={c.name}
                      handle={c.handle}
                      linkClassName={linkClass}
                      subcategories={
                        c.category_children?.map((child) => ({
                          id: child.id,
                          name: child.name,
                          handle: child.handle,
                        })) || null
                      }
                    />
                  ))}
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
            pill is 44px tall and pulled up by half that, so it stays
            centred on the rule at every width; the sections above and
            below reserve more than that in padding, so it never collides
            with their content. */}
        <div className="relative">
          <div className="h-px w-full bg-divider" />
          {/* Ink rather than brand red: red-on-white measures ~4.3:1, just
              under the 4.5:1 AA threshold for text this size, and axe-core
              flags it. Ink-900 clears it comfortably and gives the same
              high-contrast-pill-on-its-ground read as the reference. */}
          <LocalizedClientLink
            href="/store"
            className="absolute right-0 -top-[22px] inline-flex h-11 items-center justify-center rounded-radius-full bg-ink-900 px-5 text-caption font-medium text-surface-elevated transition-colors duration-standard ease-in-out hover:bg-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
            data-testid="footer-cta"
          >
            Start shopping
          </LocalizedClientLink>
        </div>

        <div className="flex flex-col gap-y-4 pb-16 pt-12 text-caption sm:flex-row sm:items-center sm:justify-between">
          <Text className="text-caption" as="span" muted>
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
