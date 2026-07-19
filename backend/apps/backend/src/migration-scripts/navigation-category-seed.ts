import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createProductCategoriesWorkflow } from "@medusajs/medusa/core-flows";

/**
 * Seeds the Product Category tree 01_NAVIGATION_SPECIFICATION.md §11 itself
 * proposes as "a reasonable default grouping (not a final decision)" for
 * the Wine & Spirits mega menu: a "Spirits" parent holding Whisky, Cognac,
 * Vodka, Gin, Rum, Tequila, and Liqueurs, plus Wines, Champagne, Beer,
 * Gift Sets, and Accessories as their own top-level entries. §11 is
 * explicit that this exact grouping is "a merchandising decision, not an
 * engineering one" — this script exists only so the mega menu has real,
 * data-driven category data to render against (and so §30's "adding a
 * category requires no code change" acceptance criterion is actually
 * testable) while Paul's real merchandising decision remains open. Every
 * category below is provisional and freely renamable/regroupable/
 * deletable from the admin without any code change, per the Navigation
 * Governance table's own rule that category tree contents are
 * "data-driven, fully... No[ developer involvement required]".
 *
 * Deliberately does not seed Food Central as a category: 01's §11/§14
 * treat "Wine & Spirits" and "Food Central" as the platform's two
 * hardcoded structural top-level branches (also §24's fallback pair),
 * not Product Category records — Food Central's own three destinations
 * (Today's Menu, Scheduled Orders, Pickup) are fixed navigation routes,
 * not a category tree (§14: "no deeper formal taxonomy layer").
 *
 * Idempotent: safe to re-run — skips any category whose handle already
 * exists rather than creating duplicates.
 */
export default async function navigation_category_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModuleService = container.resolve(Modules.PRODUCT);

  const existing = await productModuleService.listProductCategories(
    {},
    { select: ["id", "handle"] }
  );
  const existingHandles = new Set(existing.map((c) => c.handle));

  if (existingHandles.size > 0) {
    logger.info(
      `navigation-category-seed: ${existingHandles.size} categor${
        existingHandles.size === 1 ? "y" : "ies"
      } already exist — skipping already-present handles, creating only what's missing.`
    );
  }

  const topLevel: { name: string; handle: string; rank: number }[] = [
    { name: "Wines", handle: "wines", rank: 0 },
    { name: "Champagne", handle: "champagne", rank: 1 },
    { name: "Spirits", handle: "spirits", rank: 2 },
    { name: "Beer", handle: "beer", rank: 3 },
    { name: "Gift Sets", handle: "gift-sets", rank: 4 },
    { name: "Accessories", handle: "accessories", rank: 5 },
  ];

  const toCreateTopLevel = topLevel.filter((c) => !existingHandles.has(c.handle));

  let created: { id: string; handle: string | null }[] = [];
  if (toCreateTopLevel.length > 0) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: toCreateTopLevel.map((c) => ({
          name: c.name,
          handle: c.handle,
          rank: c.rank,
          is_active: true,
        })),
      },
    });
    created = result;
    logger.info(
      `navigation-category-seed: created top-level categories: ${result
        .map((c) => c.name)
        .join(", ")}`
    );
  }

  const spiritsCategory =
    created.find((c) => c.handle === "spirits") ??
    existing.find((c) => c.handle === "spirits");

  if (!spiritsCategory) {
    logger.warn(
      "navigation-category-seed: could not resolve the 'Spirits' parent category — skipping spirit sub-categories."
    );
    return;
  }

  const spiritTypes: { name: string; handle: string; rank: number }[] = [
    { name: "Whisky", handle: "whisky", rank: 0 },
    { name: "Cognac", handle: "cognac", rank: 1 },
    { name: "Vodka", handle: "vodka", rank: 2 },
    { name: "Gin", handle: "gin", rank: 3 },
    { name: "Rum", handle: "rum", rank: 4 },
    { name: "Tequila", handle: "tequila", rank: 5 },
    { name: "Liqueurs", handle: "liqueurs", rank: 6 },
  ];

  const toCreateSpiritTypes = spiritTypes.filter(
    (c) => !existingHandles.has(c.handle)
  );

  if (toCreateSpiritTypes.length > 0) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: toCreateSpiritTypes.map((c) => ({
          name: c.name,
          handle: c.handle,
          rank: c.rank,
          is_active: true,
          parent_category_id: spiritsCategory.id,
        })),
      },
    });
    logger.info(
      `navigation-category-seed: created Spirits sub-categories: ${result
        .map((c) => c.name)
        .join(", ")}`
    );
  }

  logger.info("navigation-category-seed: done.");
}
