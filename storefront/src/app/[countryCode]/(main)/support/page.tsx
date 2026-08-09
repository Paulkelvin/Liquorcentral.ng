import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Delivery & Returns",
}

/**
 * Footer "Support" destination (01_NAVIGATION_SPECIFICATION.md §8:
 * delivery policy, returns).
 *
 * Everything stated here is a fact the system already enforces rather
 * than a promise written ahead of the code: the ₦2,500 flat rate is the
 * seeded shipping option's own `FLAT_RATE_NGN`, the nationwide/Lagos
 * split is what `isLagosAddress` and the fulfillment grouping actually
 * do, pickup exists because Food Central seeds a pickup option, and
 * "online payment only" is the decision recorded in the legal page. Where
 * a detail is genuinely an unmade business decision — support contact,
 * hours, delivery windows — it is a bracketed placeholder rather than an
 * invented commitment, the same convention `/legal` uses.
 */

const SECTIONS = [
  { id: "delivery", label: "Delivery" },
  { id: "food-central", label: "Food Central" },
  { id: "returns", label: "Returns & refunds" },
  { id: "contact", label: "Contact us" },
]

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-divider pt-10 first:border-t-0 first:pt-0"
    >
      <h2 className="font-display text-[24px] text-text-primary small:text-[30px]">
        {title}
      </h2>
      <div className="mt-5 flex flex-col gap-4 text-[14.5px] leading-relaxed text-text-secondary">
        {children}
      </div>
    </section>
  )
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-2 text-[15px] font-semibold text-text-primary">
      {children}
    </h3>
  )
}

/** A stated fact with its figure pulled out, so the page can be skimmed. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-radius-md border border-divider bg-surface-elevated p-4">
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
        {label}
      </span>
      <span className="text-[15px] font-medium text-text-primary">{value}</span>
    </div>
  )
}

export default function SupportPage() {
  return (
    <div className="ds-container py-16">
      <header className="max-w-[68ch]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          Support
        </p>
        <h1 className="mt-3 font-display text-[32px] text-text-primary small:text-[42px]">
          Delivery &amp; returns
        </h1>
        <p className="mt-3 text-[14.5px] text-text-secondary">
          What it costs, how long it takes, and what happens if something
          arrives wrong.
        </p>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Fact label="Delivery fee" value="₦2,500 flat" />
        <Fact label="Liquor" value="Delivered nationwide" />
        <Fact label="Food Central" value="Lagos only" />
      </div>

      <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[200px_1fr]">
        <nav
          aria-label="Support sections"
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <ul className="flex flex-col gap-2 border-l border-divider pl-4 text-[13px]">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-text-secondary transition-colors duration-standard ease-in-out hover:text-interactive"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex max-w-[68ch] flex-col gap-14">
          <Section id="delivery" title="Delivery">
            <H3>Where we deliver</H3>
            <p>
              Wine, spirits and other liquor are delivered anywhere in
              Nigeria. Food Central is prepared in our own kitchen and
              delivered within Lagos only — see the section below.
            </p>

            <H3>What it costs</H3>
            <p>
              A flat ₦2,500 per order, anywhere in the country. The fee is
              shown in your cart and again at checkout before you pay, so
              the total you approve is the total you are charged. There are
              no separate handling or fuel surcharges.
            </p>

            <H3>How long it takes</H3>
            <p>
              [Delivery windows pending confirmation.] Your order is
              confirmed as soon as payment clears, and we contact you if
              anything about the delivery changes.
            </p>

            <H3>Receiving an order</H3>
            <p>
              Someone 18 or older must be present to accept any delivery
              containing alcohol, and may be asked for ID. If nobody who
              meets that requirement is available, the rider cannot leave
              the order — this is a legal obligation on us, not a
              preference.
            </p>

            <H3>Sold and delivered by us</H3>
            <p>
              Every order on this site is stocked, sold and delivered by
              LiquorCentral. There are no third-party sellers and no
              marketplace vendors, so there is only ever one company to
              hold responsible if something goes wrong.
            </p>
          </Section>

          <Section id="food-central" title="Food Central">
            <H3>Lagos only</H3>
            <p>
              Food is cooked to order, so it is delivered within Lagos only.
              If your delivery address is outside Lagos you can still order
              liquor for nationwide delivery — the cart keeps the two apart
              and will tell you before checkout if something in it cannot
              reach your address.
            </p>

            <H3>Same-day, scheduled, or pickup</H3>
            <p>
              Order from today&apos;s menu for same-day delivery, schedule
              an order for later, or collect it yourself from our kitchen.
              Pickup orders carry no delivery fee.
            </p>

            <H3>Ordering liquor and food together</H3>
            <p>
              You can. They are prepared and dispatched separately — liquor
              from our warehouse, food from the kitchen — so they may arrive
              at different times. Your cart and order confirmation always
              show the two as separate groups rather than merging them into
              one delivery promise.
            </p>
          </Section>

          <Section id="returns" title="Returns & refunds">
            <H3>Before dispatch</H3>
            <p>
              Cancel any order before it is dispatched and you are refunded
              in full.
            </p>

            <H3>Liquor, after delivery</H3>
            <p>
              Because alcohol is age-restricted and consumable, a correctly
              delivered, unopened bottle cannot be returned for a change of
              mind. If an order arrives damaged, incorrect or faulty,
              contact us within 48 hours with your order number and a photo
              and we will replace or refund it.
            </p>

            <H3>Food, after delivery</H3>
            <p>
              Food is prepared to order and cannot be cancelled once
              preparation has started. If an order arrives incorrect or
              materially different from what you ordered, contact us within
              2 hours.
            </p>

            <H3>How refunds are paid</H3>
            <p>
              To your original payment method. We accept online payment only
              — card or bank transfer — and do not offer cash on delivery,
              so there is always a payment method to refund to. [Processing
              time pending confirmation.]
            </p>

            <p>
              The full policy, including your rights under Nigerian
              consumer-protection law, is on the{" "}
              <LocalizedClientLink
                href="/legal#refunds"
                className="text-interactive underline underline-offset-4 hover:text-interactive-hover"
              >
                Legal &amp; Compliance
              </LocalizedClientLink>{" "}
              page.
            </p>
          </Section>

          <Section id="contact" title="Contact us">
            <p>
              For anything about a live order, quote your order number — it
              is on your confirmation and in{" "}
              <LocalizedClientLink
                href="/account/orders"
                className="text-interactive underline underline-offset-4 hover:text-interactive-hover"
              >
                your account
              </LocalizedClientLink>
              .
            </p>
            <ul className="ml-5 flex list-disc flex-col gap-2 marker:text-text-muted">
              <li>Email: [support email]</li>
              <li>WhatsApp: [WhatsApp number]</li>
              <li>Hours: [support hours]</li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  )
}
