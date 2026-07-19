import { listCategories } from "@lib/data/categories";
import { listCollections } from "@lib/data/collections";
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
    <footer className="border-t border-border w-full">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-10 xsmall:flex-row items-start justify-between py-24">
          <div>
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus text-text-secondary hover:text-text-primary uppercase"
            >
              LiquorCentral
            </LocalizedClientLink>
          </div>
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-5 w-full sm:w-auto">
            {topLevelCategories.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus text-text-primary">Shop</span>
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
                      <li
                        className="flex flex-col gap-2 text-text-secondary txt-small"
                        key={c.id}
                      >
                        <LocalizedClientLink
                          className={clx(
                            "hover:text-text-primary",
                            children && "txt-small-plus"
                          )}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="grid grid-cols-1 ml-3 gap-2">
                            {children.map((child) => (
                              <li key={child.id}>
                                <LocalizedClientLink
                                  className="hover:text-text-primary"
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

            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus text-text-primary">
                Food Central
              </span>
              <ul className="grid grid-cols-1 gap-2 text-text-secondary txt-small">
                {FOOD_CENTRAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <LocalizedClientLink
                      className="hover:text-text-primary"
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
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus text-text-primary">
                  Collections
                </span>
                <ul className="grid grid-cols-1 gap-2 text-text-secondary txt-small">
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-text-primary"
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

            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus text-text-primary">
                Company
              </span>
              <ul className="grid grid-cols-1 gap-2 text-text-secondary txt-small">
                {COMPANY_LINKS.map((link) => (
                  <li key={link.href}>
                    <LocalizedClientLink
                      className="hover:text-text-primary"
                      href={link.href}
                      data-testid="footer-link"
                    >
                      {link.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus text-text-primary">
                Support
              </span>
              <ul className="grid grid-cols-1 gap-2 text-text-secondary txt-small">
                {SUPPORT_LINKS.map((link) => (
                  <li key={link.href}>
                    <LocalizedClientLink
                      className="hover:text-text-primary"
                      href={link.href}
                      data-testid="footer-link"
                    >
                      {link.label}
                    </LocalizedClientLink>
                  </li>
                ))}
                {LEGAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <LocalizedClientLink
                      className="hover:text-text-primary"
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
        <div className="flex w-full mb-16 justify-between text-text-muted">
          <Text className="txt-compact-small" as="span">
            © {new Date().getFullYear()} LiquorCentral. All rights reserved.
          </Text>
        </div>
      </div>
    </footer>
  );
}
