# LiquorCentral Product Blueprint — v1

**Status:** Draft v1 — pending Paul's review and approval.
**Scope:** Product definition only. No UI, wireframes, or branding are defined here — this document defines *what* LiquorCentral is and *why* it's structured the way it is; visual design begins only after this is approved.

> **Supersession notice.** Earlier research explored a multi-vendor marketplace architecture (a Vendor module, vendor staff accounts, an order-splitting workflow, per-vendor payouts). That model is **retired as of this version**. LiquorCentral is confirmed as a single company, with no vendors, no vendor onboarding, no vendor dashboard, no vendor payouts, and no marketplace commissions. Everything else from earlier research — storefront choice, search, CMS, delivery-zone mechanics, the product-attribute extension pattern, and Nigerian-market findings — still holds and is built on directly below.

## At a glance

| | |
|---|---|
| **Structure** | One company, one Medusa store, two product lines under one brand |
| **Wine & Spirits delivery** | Nationwide |
| **Food Central delivery** | Lagos only, cooked to order, company-owned riders |
| **Checkout** | One cart, one checkout — no order-splitting |
| **Age gate** | Popup required before browsing alcohol |
| **Guest checkout** | Supported |

---

## 1. Vision

**Decision:** LiquorCentral is the platform Nigerians trust to deliver a bottle of wine and a home-cooked meal with the same care — curated, fast, and confident enough to buy on impulse.

### Reasoning
Every downstream decision — catalog structure, navigation, trust content — needs a single yardstick to be judged against. "Confident enough to purchase immediately" is that yardstick: specific enough to reject decisions that add friction or hesitation, even ones that look reasonable in isolation.

### Business Benefit
The vision is written to hold both product lines in one sentence deliberately — it is the clearest signal that this is one brand with two offerings, not two businesses sharing a domain name.

### Medusa Impact
Medusa is headless and brand-agnostic by design; it has no opinion on vision or voice. What it guarantees is the structural precondition for the vision to be deliverable as *one* experience: a single store, a single customer identity, and a single cart that can hold both a wine and a dish, with no architectural seam forcing two separate purchase flows.

---

## 2. Brand Positioning

**Decision:** Food Central is a trusted product line of LiquorCentral, not a separate seller sharing shelf space — closer to "a fine restaurant's own in-house kitchen" than to a marketplace stall.

### Reasoning
The confirmed no-marketplace model has a direct positioning consequence: there is no "sold by a third party" framing to manage, and no risk of one underperforming vendor damaging trust in the rest of the catalog. Positioning should say this plainly, because it is a genuine differentiator, not a technicality.

### Business Benefit
Trust earned on one line transfers to the other — a customer who trusts LiquorCentral's wine sourcing is predisposed to trust Food Central's kitchen, and vice versa, *because* it is the same operator. This compounds the "trustworthy" and "confident enough to purchase immediately" goals rather than requiring two separate trust-building efforts.

### Medusa Impact
Implemented as one Medusa **Store** with two curated product lines distinguished by Category/Collection — not two stores, not two tenants, not a multi-vendor configuration. This is the simplest possible mapping of the business model onto Medusa's data model, and it is available precisely because there are no vendors to isolate.

---

## 3. Product Philosophy

**Decision:** Fewer, completely-described products beat many thinly-described ones. Every listing should carry enough structured information that a first-time buyer can decide without leaving the site.

### Reasoning
Prior research found most wine buyers choose by label/suggestion rather than expertise, and that food-ordering trust hinges on transparency (ingredients, prep time). Both point to the same conclusion: data completeness per product converts uncertainty into confidence — catalog breadth does not.

### Business Benefit
This philosophy is what makes "confident enough to purchase immediately" achievable in practice. An incomplete product page is the most common, most avoidable tax on conversion for a buyer unfamiliar with the category.

### Medusa Impact
Supported by the Product module's native fields plus the structured attribute pattern defined in §13 (Product Data Strategy). This section states the standard; §13 is where it becomes a concrete data model.

---

## 4. Customer Types

**Decision:** Four intents, one identity — the Confident Buyer, the Guided Browser, the Repeat Household, and the Gifter — and critically, the same person moves between all four across both product lines.

### Reasoning
These are not marketing personas; they are distinct *intents* that should shape discovery and pacing. A Confident Buyer wants speed and a direct path to checkout; a Guided Browser wants curation and pairing suggestions. A Repeat Household plausibly orders wine and food from the same account in the same week.

### Business Benefit
Designing for intent, not for "which catalog," is what lets the platform be simultaneously "extremely fast" for food and "discovery-encouraging" for wine without contradiction — the two goals apply to different intents, not to different platforms.

### Medusa Impact
One `Customer` record, one `Cart`, purchasing across both product lines in a single session — exactly what the no-marketplace, single-company model buys structurally. There is no actor-type split, no per-line account system, and no reason to ever build one.

---

## 5. Information Architecture

**Decision:** One shared shell (header, search, cart, account) over two clearly-branded sections — not two microsites, not one undifferentiated catalog.

```
Home (shared brand shell)
├── Wine & Spirits
│   ├── Wine
│   ├── Spirits
│   ├── Gifting
│   └── Curated / Sommelier's Picks
├── Food Central
│   ├── Today's Menu
│   ├── Scheduled Orders
│   └── Pickup
├── Account
└── Cart / Checkout (shared — one cart)
    └── Delivery step (branches per item: nationwide courier vs. Lagos rider)
```

See `INFORMATION_ARCHITECTURE.md` for the full detail behind this structure.

### Reasoning
Two disconnected microsites would satisfy neither business goal well — wine needs room for discovery, food needs to be fast and menu-like, and forcing one navigational pattern onto both would compromise one or the other. A shared shell with two purpose-built branches serves both without fragmenting the brand.

### Business Benefit
This is the structural answer to "must feel like one cohesive brand rather than two disconnected businesses" — decided at the architecture level, before any visual design, so the requirement cannot be lost later in execution.

### Medusa Impact
**Native.** Product Categories and Collections model this two-branch structure inside one Medusa store; no custom module is required for the IA itself.

> **Open question for Paul:** the exact set of curated/occasion collections (e.g. "Gifting," "Sommelier's Picks") has not been finalized — this is a merchandising decision, not an engineering one, and is needed before storefront navigation can be built.

---

## 6. Product Catalog Strategy

**Decision:** Two catalog behaviors, one Product module. Wine & Spirits is stocked and vintage-tracked; Food Central is made-to-order with no long-term stock count.

| | Wine & Spirits | Food Central |
|---|---|---|
| Inventory model | Stocked, quantity-tracked per warehouse | Made-to-order — inventory tracking off; availability is a kitchen-capacity/time question |
| Delivery scope | Nationwide | Lagos only |
| Catalog lifespan | Vintages come and go; some items are genuinely finite | Menu items are largely evergreen; daily/seasonal specials rotate |
| Key attributes | Vintage, ABV, region, tasting notes (§13) | Ingredients, allergens, spice level, prep time (§13) |

### Reasoning
Treating food as "just another stocked category" would create false signals — a dish should never show a misleading "out of stock" the way a sold-out vintage rightly does, because the constraint is kitchen capacity and timing, not a warehouse count.

### Business Benefit
Getting this distinction right avoids two operational failure modes: overselling food beyond kitchen capacity, and needlessly hiding wine that is genuinely available. Both directly affect the "fast" and "trustworthy" goals.

### Medusa Impact
**Native.** Both behaviors are configurations of the same Product module (the per-variant inventory-management flag, plus Lagos-scoped fulfillment availability from §10) — no separate catalog system, no custom module for the catalog structure itself. See `PRODUCT_CATALOG.md` for detail.

---

## 7. Navigation Strategy

**Decision:** One persistent shell, two internal navigation patterns — a mega-menu-style browse for Wine & Spirits, a fast menu-list pattern for Food Central — under one header, search bar, cart, and account.

### Reasoning
Forcing identical navigation onto both catalogs would compromise one of them — a mega-menu is right for a discovery-oriented wine catalog and wrong for a fast food-ordering flow. What must stay identical is the shell around them.

### Business Benefit
Preserves the cohesive-brand requirement at the shell level while letting each line's deeper navigation serve its actual purpose — discovery for wine, speed for food — without contradiction.

### Medusa Impact
**Storefront-only.** Navigation is a frontend concern layered over the Category/Collection data from §5–§6; no backend implication.

---

## 8. Search Strategy

**Decision:** One shared search bar spanning both catalogs, with results clearly labeled by product line so a search never confusingly mixes a wine and a dish without explanation.

### Reasoning
A customer should not need to know which "section" a term belongs to before searching — one search bar with clear result labeling keeps the experience feeling like one platform, while still preventing genuine confusion between two very different kinds of product.

### Business Benefit
Reinforces the unified-brand requirement at the interaction level, and supports "fast" for food-focused searches and "discovery" for wine-focused ones within the same mechanism.

### Medusa Impact
**Custom + storefront.** Meilisearch was recommended in earlier research (open-source, officially documented for Medusa, strong faceting) indexing one unified catalog with a product-line facet, rather than the vendor-scoped index a marketplace would have needed.

> **Open question for Paul:** the Meilisearch recommendation (over Algolia/Elasticsearch/Typesense) has not been formally signed off, and the exact facet set to ship at launch is still open. See `MEDUSA_EXTENSIONS.md`.

---

## 9. Checkout Strategy

**Decision:** One cart, one checkout — even for a mixed order containing both a bottle of wine and a Food Central dish. No order-splitting logic of any kind.

### Reasoning
This is the single biggest simplification the confirmed no-marketplace decision buys: the earlier marketplace research scoped a whole workflow to split one customer order into several vendor orders. With one company, that workflow is unnecessary — a mixed cart is still just one order, with two different fulfillment legs attached to different line items.

### Business Benefit
A single checkout for a mixed cart is exactly what "feels like one cohesive brand" requires operationally, not just visually — a customer buying both should never feel like they are checking out twice.

### Medusa Impact
**Native.** Medusa's Cart/Order modules already support multiple line items with different shipping methods attached within one order — no custom workflow is needed. Guest checkout is native and stays on. Age confirmation happens earlier, at first browse of alcohol (§11), not re-litigated at checkout — though a final compliance check at order confirmation is a reasonable backstop.

> **Open question for Paul:** should there be a hard age/compliance re-check at order confirmation (a backstop), in addition to the entry pop-up? And what should the alcohol return/refund policy say, given legal limits on alcohol returns? Both are legal/business decisions, not engineering ones.

---

## 10. Delivery Strategy

**Decision:** Two fulfillment models under one checkout — nationwide courier delivery for Wine & Spirits; Lagos-only, company-rider delivery for Food Central, with same-day, scheduled, and pickup options.

| | Wine & Spirits | Food Central |
|---|---|---|
| Coverage | Nationwide | Lagos only |
| Fulfillment model | Standard warehouse dispatch via courier | Cooked to order, dispatched by company-owned riders |
| Timing options | Standard delivery windows | Same-day, scheduled slot, or pickup |
| Medusa mechanics | A broad Service Zone (or a few regional ones) with standard Shipping Options | A Lagos-restricted Service Zone/Geo Zone, plus a small custom slot-scheduling module tied to kitchen prep time |

See `DELIVERY_MODEL.md` for full detail.

### Reasoning
These are genuinely different operational problems — one is "get a stocked item anywhere in the country," the other is "cook and deliver a fresh item within a city, on a clock." Modeling them as two configurations of the same fulfillment primitives, rather than two separate systems, keeps one checkout coherent.

### Business Benefit
This section is where the business's explicit operational facts (nationwide vs. Lagos-only, company riders, cooked-on-demand) become concrete platform behavior — getting the geographic restriction and slot-based scheduling right here is what makes the business goals true at checkout, not just marketing copy.

### Medusa Impact
**Mostly native.** Multi-warehouse, geo-restricted delivery areas, and pickup are all native Fulfillment-module behavior. The one piece of new backend work is a delivery-slot scheduling module, purpose-built around kitchen prep/cook time. Because riders are company-owned, no third-party carrier API integration is required for v1; the existing manual fulfillment provider is sufficient, with rider dispatch handled operationally for now (see §17).

> **Open question for Paul:** whether cash-on-delivery is supported at all for alcohol (fraud/reconciliation tradeoffs), and which local payment provider (Paystack/Flutterwave-class) to integrate. See `MEDUSA_EXTENSIONS.md` and `BUSINESS_RULES.md`.

---

## 11. Trust Strategy

**Decision:** Age confirmation before browsing alcohol, plus an explicit "sold and delivered by us directly" claim — a trust advantage only available because there is no marketplace.

### Reasoning
An age-gate is a legal necessity, but it is also the first trust signal a visitor sees — framed as a confidence-building step rather than a punitive obstacle, it can reinforce "trustworthy" rather than undercut "fast" and "easy to use." Because there are no vendors, LiquorCentral can truthfully claim direct control over sourcing, cooking, and delivery — a stronger trust claim than most retailers can make.

### Business Benefit
Directly serves "trustworthy" and "confident enough to purchase immediately." The no-marketplace model turns what could have been just a technical detail into an actual trust asset worth stating on-site.

### Medusa Impact
**Storefront-only.** The age-gate is a session-scoped interstitial gating entry into alcohol categories — no backend change. The "sold directly by us" claim requires zero technical work, since it is structurally true by the absence of a Vendor module.

> **Open question for Paul:** exact age-gate mechanics (once per session vs. once per device/cookie duration; site-wide vs. only when entering alcohol categories) are not yet decided — this affects both legal compliance posture and first-visit experience.

---

## 12. Content Strategy

**Decision:** One voice across two subjects. Wine content favors tasting notes and provenance storytelling; Food Central content favors ingredient transparency and prep-time honesty — both written to a single shared tone and style standard.

### Reasoning
Product copy is the layer most likely to accidentally diverge into "two businesses" if wine and food descriptions are written independently, at different times, by different people, without a shared standard to check against.

### Business Benefit
Reinforces the cohesive-brand requirement precisely where it is most fragile — the actual words customers read — and supports the Product Philosophy (§3) by setting a bar for what "complete" product content looks like on each line.

### Medusa Impact
Product-level content (title, description, tasting notes, ingredients) lives natively in the Product module plus the attribute module (§13). A CMS remains the right home for editorial/marketing content only — seasonal stories, campaigns — synced one-way from Medusa, never the reverse, so there is exactly one place each fact lives.

> **Open question for Paul:** CMS choice (Sanity was recommended in earlier research) has not been formally approved, and is not urgent for v1 — see `ROADMAP.md`.

---

## 13. Product Data Strategy

**Decision:** Two focused, linked attribute modules — not one universal one. A wine has no spice level; a dish has no vintage. Keep the two data shapes separate and validated, joined to Product the same documented way.

### Reasoning
A single module trying to cover both product lines would accumulate nullable, mostly-irrelevant fields per product — worse for validation, worse for admin usability. Two small, purpose-fit modules are easier to reason about and extend independently as each catalog evolves.

### Business Benefit
This is the concrete technical backbone of the Product Philosophy (§3) — structured, validated data per catalog type is what actually lets a customer decide with confidence, rather than a general-purpose free-text field standing in for it.

### Medusa Impact
**Custom modules.** Two small modules (e.g. `wine-details`, `food-details`), each linked 1:1 to Product via Medusa's `defineLink` — the same documented, low-risk extension pattern used throughout. No core changes either way. See `MEDUSA_EXTENSIONS.md` and `PRODUCT_CATALOG.md`.

> **Open question for Paul:** the exact field list per module (which wine/food attributes ship in v1 vs. later) is not finalized — see `PRODUCT_CATALOG.md`.

---

## 14. Mobile Strategy

**Decision:** Mobile-first for both lines, with a stricter performance bar for Food Central — a food order is more likely to be a fast, one-thumb, on-the-go action than a considered wine purchase.

### Reasoning
Both lines need mobile-first design, but "extremely fast" is stated as a specific requirement for food ordering — that justifies holding Food Central's interaction and load-time budget to a stricter standard than Wine & Spirits, which can reasonably tolerate a slightly more browsing-oriented pace even on mobile.

### Business Benefit
Directly serves the explicit "fast" goal for food while keeping the platform-wide mobile-first discipline intact for wine.

### Medusa Impact
**Storefront-only.** No backend implication — this is a frontend performance and interaction-design discipline.

---

## 15. Accessibility Principles

**Decision:** Contrast, keyboard navigation, alt text, and focus states are a launch requirement, not a follow-up task — applied identically across both product lines.

### Reasoning
Cheaper to build in from day one than to retrofit once both catalogs' UI exists; also matters for far more customers than a "niche accommodation" framing implies — glare, one-handed phone use, and older devices affect nearly everyone occasionally.

### Business Benefit
An accessibility failure is a usability failure under real-world conditions, which directly works against "easy to use" and "optimized for conversion" for a meaningful share of visits.

### Medusa Impact
**Storefront-only.** An independent frontend discipline, unrelated to backend architecture.

---

## 16. Performance Principles

**Decision:** Treat page-weight and interaction latency as a conversion metric, not just an engineering one — with an explicit performance budget set as part of "done," held stricter for Food Central.

### Reasoning
The business goals state "fast" and "optimized for conversion" side by side deliberately — performance should be measured and gated the same way conversion is, not treated as an afterthought engineering concern.

### Business Benefit
Gives "fast" a concrete, checkable definition instead of a vague aspiration, tied explicitly to the business's own success metric.

### Medusa Impact
**Mostly storefront.** The storefront's rendering approach is the primary lever; Medusa's own Query/caching layer (native) is the secondary lever, addressed by using it correctly rather than by new backend work.

> **Note (no Paul approval required):** the specific numeric performance budget (target load/interaction times) is an engineering decision to propose and hold itself accountable to, not a business decision.

---

## 17. Future Expansion Considerations

**Decision:** Deliberately deferred, not designed: any future marketplace/vendor model, a dedicated rider-dispatch module, loyalty/subscription mechanics, and a native mobile app.

- **Marketplace/vendors** — the earlier vendor architecture research remains a valid reference *if* this business-model decision is ever revisited, but is explicitly out of scope now (see the supersession notice above).
- **Rider dispatch** — currently an operational process (company staff, manual/WhatsApp-driven coordination), not a software module. Worth revisiting as a lightweight custom module only once delivery volume justifies it.
- **Loyalty/subscription** — a strong fit given this category's naturally recurring purchase pattern, but not committed to v1.
- **Native mobile app** — sequenced after the web storefront's flows are proven, per `ROADMAP.md`.

### Reasoning
Naming what's deferred, and why, keeps this v1 blueprint honest about its scope while making clear that none of these are blocked by today's decisions — they are additive.

### Business Benefit
Prevents scope creep into this version while giving confidence that growth paths remain open — a legitimate business concern worth answering explicitly rather than leaving implicit.

### Medusa Impact
This is exactly what Medusa's module-link extension model guarantees: new modules can be added later without touching core or requiring a rebuild of what exists today. Deferring is a sequencing choice, not a technical risk.

---

## 18. Risks & Assumptions

### Risks

- **Geographic confusion.** A customer outside Lagos attempting to order Food Central needs to see that restriction clearly and early — not as a late checkout rejection, which would read as broken rather than intentional.
- **Age-gate framing.** If it reads as punitive rather than reassuring, the same legal requirement can hurt the "premium, fast" first impression instead of reinforcing "trustworthy."
- **Mixed-cart delivery clarity.** A cart containing both a nationwide-courier wine and a same-day Lagos dish needs unambiguous, separate delivery-date messaging per item — conflating them risks a confusing promise neither fulfillment leg can keep.
- **Content-quality bar is an ongoing operational cost.** The Product Philosophy (§3) requires continuous content investment as the catalog grows, not a one-time setup task — a process risk, not only a technical one.
- **No vendor buffer.** With no marketplace layer, every quality and delivery failure is directly LiquorCentral's — there is no "that was the vendor's fault" framing available, which raises the operational stakes behind this blueprint's execution.

### Assumptions

- Single Nigerian region and currency for v1 — no multi-region/multi-currency requirement implied by anything in this blueprint.
- One Medusa store instance is sufficient; no multi-tenant or multi-store configuration is needed.
- No third-party carrier API integration is required for v1, given company-owned riders and operationally-managed dispatch.
- The storefront, search, CMS, and payment/notification-provider recommendations from earlier research remain directionally valid and are unaffected by the marketplace-to-single-company pivot — only the vendor-specific sections of that research are retired. **None of these are formally approved yet** — see the open questions flagged throughout this document and consolidated in `PROJECT_STATUS.md`.

---

**Document status:** Draft v1, awaiting Paul's review and approval. Upon approval, this document becomes the reference all subsequent visual design and implementation work is checked against. See `PROJECT_STATUS.md` for the consolidated list of open questions and `DECISION_LOG.md` once each is resolved.
