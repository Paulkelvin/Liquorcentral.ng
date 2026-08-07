import { listCategories } from "@lib/data/categories";
import { listCollections } from "@lib/data/collections";
import { Text } from "@modules/common/components/ui";

import LocalizedClientLink from "@modules/common/components/localized-client-link";

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

const COMPANY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Journal", href: "/blog" },
];
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

/**
 * Scaled down from 44px to 36px on Paul's note that the group was
 * overpowering, with the ring dropped from `border` (ink-300) to `divider`
 * (ink-200) so its weight reads closer to the paragraph above it.
 *
 * **36px is the drawn size, not the target size.** `DESIGN_SYSTEM.md` §B11
 * fixes a 44×44px minimum "regardless of visual size" and anticipates
 * exactly this ("a small visual icon can still sit inside a larger tap
 * area"), so the invisible `::before` restores the full 44px. Same
 * technique as the cart drawer's compact quantity stepper. A consequence
 * worth knowing: this element must never gain `overflow-hidden`, which
 * would clip the expanded hit area along with everything else.
 */
const socialButtonClass =
  "relative flex h-9 w-9 items-center justify-center rounded-radius-full border border-divider text-text-secondary transition-colors duration-standard ease-in-out before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']";

/** Shared heading for each footer link group — small, uppercase, tracked out. */
function GroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-caption font-medium uppercase tracking-wider text-text-primary">
      {children}
    </span>
  );
}

/**
 * Footer links sit at `text-primary`, not `text-secondary`.
 *
 * The whole footer is small type on a low-contrast ground, and at
 * `text-secondary` (ink-700) the link lists read as disabled next to their
 * own headings — 8.9:1 is technically fine and still looked washed out.
 * ink-900 measures 15.7:1 and makes the lists read as the navigation they
 * are. Hover moves to the interactive green so the state change is still
 * legible now that the resting colour is the darkest step.
 */
const linkClass =
  "text-text-primary hover:text-interactive transition-colors duration-standard ease-in-out";

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
          <div className="flex flex-col gap-y-3 lg:col-span-3">
            <LocalizedClientLink
              href="/"
              className="font-display text-heading-4 font-semibold tracking-tight text-text-primary hover:text-interactive"
            >
              LiquorCentral
            </LocalizedClientLink>
            {/* Its own step in the hierarchy, deliberately.
                Wordmark (20px display) → this (15px) → link lists and
                headings (13px). At `text-caption`/`muted` it sat at exactly
                the same size and a *lighter* colour than the link columns
                beside it, so the brand's one sentence of positioning read as
                the least important text in the footer. 15px and
                `text-secondary` (8.9:1, up from muted's 4.77:1) put it
                between the name above and the navigation beside it, which is
                where it belongs. `max-w-[32ch]` keeps the measure readable
                now that the type is larger. */}
            <Text className="max-w-[32ch] !text-[15px] leading-relaxed text-text-secondary">
              Premium wine, spirits, and Nigerian food — sold and delivered
              directly by us, never a stranger.
            </Text>

            {/* `-ml-1` is optical, not geometric. The circles' border boxes
                already start at the column's left edge, but a round outline
                reads as inset against the flat left edge of the paragraph
                above; 2px is the standard overshoot for a round shape, and
                leaves the circle reading flush with the "P" of "Premium"
                rather than measurably outdented. */}
            <ul className="-ml-[2px] mt-1 flex flex-wrap items-center gap-1.5">
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

            {/* The two trust statements that used to sit here are gone —
                `TrustBand` above the footer now carries all four of §13's
                claims, and repeating two of them 200px lower said the same
                thing twice. */}
          </div>

          {/* Link groups, fully expanded at every width. They were briefly
              accordions on mobile; Paul asked for the lists visible instead,
              so the disclosure is gone rather than merely defaulted open —
              a control that never collapses anything is worse than no
              control. `gap-y-8` keeps the stacked groups reading as separate
              blocks now that nothing delimits them. */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 text-caption sm:grid-cols-3 lg:col-span-9 lg:grid-cols-5">
            {topLevelCategories.length > 0 && (
              <div className="flex flex-col gap-y-3">
                <GroupHeading>Shop</GroupHeading>
                {/* Flat links, one per top-level category. The nested
                    "Spirits ⌄" disclosure that used to live here is gone on
                    Paul's direction: a dropdown inside a footer is awkward on
                    touch, and the parent category page already lists its own
                    subcategories. Nothing becomes unreachable — only one tap
                    further away. */}
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {topLevelCategories.map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className={linkClass}
                        href={`/categories/${c.handle}`}
                        data-testid="category-link"
                      >
                        {c.name}
                      </LocalizedClientLink>
                    </li>
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

        {/* Just the hairline. A "Start shopping" pill used to float on
            this rule; it read as an unanchored floating button rather
            than footer furniture, and on the cart and checkout it urged
            the customer away from the order they were completing. The
            SHOP column above already leads everywhere it did. */}
        <div className="h-px w-full bg-divider" />

        <div className="flex flex-col gap-y-4 pb-16 pt-12 text-caption sm:flex-row sm:items-center sm:justify-between">
          <Text className="text-caption" as="span" muted>
            © {new Date().getFullYear()} LiquorCentral. All rights reserved.
          </Text>
          <div className="flex flex-wrap gap-x-8 gap-y-2 uppercase tracking-wider">
            {LEGAL_LINKS.map((link) => (
              <LocalizedClientLink
                key={link.href}
                className={`${linkClass} underline-offset-4 hover:underline`}
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
