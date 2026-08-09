import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Legal & Compliance",
}

/**
 * Footer "Legal/Compliance" destination (01_NAVIGATION_SPECIFICATION.md
 * §8) — one page, four sections, matching the footer's single
 * "Legal & Compliance" link rather than four separate routes nothing
 * links to.
 *
 * This is a working draft written to be accurate to what the platform
 * actually does today (guest checkout, Paystack once configured, NDPR-
 * relevant personal data collected at checkout, nationwide liquor
 * delivery / Lagos-only Food Central). It is not a substitute for review
 * by counsel before this is relied on in production — the banner below
 * says so on the page itself, not just in this comment, because a legal
 * page silently going live unreviewed is worse than one that visibly
 * says it hasn't been yet.
 */

const SECTIONS = [
  { id: "privacy", label: "Privacy Policy" },
  { id: "terms", label: "Terms of Service" },
  { id: "refunds", label: "Refunds & Cancellations" },
  { id: "cookies", label: "Cookie Policy" },
]

const LAST_UPDATED = "9 August 2026"

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
    <section id={id} className="scroll-mt-24 border-t border-divider pt-10 first:border-t-0 first:pt-0">
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

export default function LegalPage() {
  return (
    <div className="ds-container py-16">
      <header className="max-w-[68ch]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          Legal &amp; Compliance
        </p>
        <h1 className="mt-3 font-display text-[32px] text-text-primary small:text-[42px]">
          Privacy, terms &amp; policies
        </h1>
        <p className="mt-3 text-[14.5px] text-text-secondary">
          Last updated {LAST_UPDATED}.
        </p>
      </header>

      {/* Working-draft notice. Deliberately the loudest thing on the
          page — everything below is written to be accurate to the
          product, but a policy this consequential (alcohol sale,
          personal data, payment) shouldn't read as final until someone
          with legal authority has actually signed off on it. */}
      <div
        className="mt-8 max-w-[68ch] rounded-radius-md border border-warning bg-warning-tint p-5 text-[13.5px] leading-relaxed text-warning-on-tint"
        role="note"
      >
        <p className="font-semibold">Working draft — pending legal review.</p>
        <p className="mt-1.5">
          This page is written to accurately describe how LiquorCentral
          operates today. It has not yet been reviewed by qualified
          counsel and should not be treated as final until it has —
          particularly the Nigeria Data Protection Act (NDPA)
          registration/compliance items and the alcohol-sale terms.
          Bracketed placeholders (e.g. <code>[Registered company name]</code>)
          mark the details engineering doesn&apos;t hold and can&apos;t
          invent.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[200px_1fr]">
        {/* In-page nav, sticky on larger screens. Plain anchor links —
            same reasoning the footer itself already documents: real
            `<a href>`s, not JS-only scroll handlers. */}
        <nav aria-label="Legal sections" className="lg:sticky lg:top-24 lg:self-start">
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
          <Section id="privacy" title="Privacy Policy">
            <p>
              This policy explains what personal information
              LiquorCentral (&quot;we&quot;, &quot;us&quot;) collects when
              you use this site, why, and what rights you have over it
              under the Nigeria Data Protection Act, 2023 (NDPA).
            </p>

            <H3>What we collect</H3>
            <p>
              Directly from you: name, delivery address, phone number,
              email address, and date-of-birth confirmation (age-gate),
              collected at checkout — guest checkout is supported, so an
              account is never required to buy. If you create an account,
              we also hold your order history and any saved addresses.
            </p>
            <p>
              From your payment: we do not store card numbers. Payment is
              processed by our payment provider, [Paystack — pending
              activation]; they hold your card details under their own
              PCI-DSS compliance, and we receive only a confirmation that
              payment succeeded or failed.
            </p>
            <p>
              Automatically: standard technical data (IP address, device/
              browser type, pages visited) via cookies — see the Cookie
              Policy below.
            </p>

            <H3>Why we collect it</H3>
            <p>
              To take and fulfil your order (address and phone are shared
              with our delivery riders/courier for that order only), to
              confirm you meet the legal drinking age before selling
              alcohol, to send order updates, and to meet our own
              record-keeping obligations as an alcohol retailer.
            </p>

            <H3>Who we share it with</H3>
            <p>
              Our payment processor (to take payment), our delivery
              riders/courier (to complete delivery), and our hosting/
              infrastructure providers (to run the site). We do not sell
              your personal information to third parties.
            </p>

            <H3>How long we keep it</H3>
            <p>
              [Retention period pending decision — see internal decision
              log]. Order records are typically kept for the period
              required by Nigerian tax and consumer-protection law even
              after an account is deleted.
            </p>

            <H3>Your rights</H3>
            <p>
              Under the NDPA you can ask us what personal data we hold
              about you, ask us to correct it, ask us to delete it
              (subject to the record-keeping exception above), and
              withdraw consent to marketing communications at any time.
              To exercise any of these, contact us at{" "}
              <span className="whitespace-nowrap">[support email]</span>.
            </p>

            <H3>Age-restricted sales</H3>
            <p>
              You must be 18 or older to purchase alcohol from this site,
              confirmed at entry and again at checkout. We may decline or
              cancel an order where we reasonably believe this
              requirement isn&apos;t met.
            </p>
          </Section>

          <Section id="terms" title="Terms of Service">
            <p>
              These terms govern any order placed through
              liquorcentral.ng. By placing an order, you accept them.
            </p>

            <H3>Who we are</H3>
            <p>
              LiquorCentral is operated by [Registered company name], RC
              number [RC number], registered address [registered
              address], Nigeria.
            </p>

            <H3>Products &amp; availability</H3>
            <p>
              We sell wine, spirits and other alcoholic beverages
              (delivered nationwide within Nigeria) and, separately,
              prepared food through Food Central (delivered within Lagos
              only). Listed prices are in Nigerian Naira (₦) and include
              applicable tax; delivery fees are shown before you pay.
              Stock is confirmed at checkout, not at browse time — an
              item can sell out between adding it to your cart and paying.
            </p>

            <H3>Orders &amp; payment</H3>
            <p>
              An order is placed once payment is confirmed by our payment
              provider. We&apos;ll reject or cancel an order (with a full
              refund) if we can&apos;t fulfil it — out of stock, delivery
              address outside our current delivery area, or a failed
              age-verification check.
            </p>

            <H3>Delivery</H3>
            <p>
              Delivery windows and fees are estimates shown at checkout,
              not a guaranteed delivery time. Someone 18 or older must be
              present to accept an alcohol delivery and may be asked for
              ID; we may decline to leave alcohol with anyone who cannot
              show they meet the legal drinking age.
            </p>

            <H3>Your responsibilities</H3>
            <p>
              You confirm the age, delivery and payment details you
              provide are accurate, and that you are the account holder
              or have authority to place the order.
            </p>

            <H3>Liability</H3>
            <p>
              [Standard limitation-of-liability clause — to be drafted by
              counsel]. Nothing in these terms limits any right you have
              under Nigerian consumer-protection law that can&apos;t
              lawfully be excluded.
            </p>

            <H3>Changes to these terms</H3>
            <p>
              We may update these terms as the service changes; the
              &quot;last updated&quot; date above will always reflect the
              current version.
            </p>
          </Section>

          <Section id="refunds" title="Refunds & Cancellations">
            <H3>Wine &amp; spirits</H3>
            <p>
              You can cancel an order any time before it&apos;s dispatched
              for a full refund. Once dispatched, alcohol can only be
              returned if it arrived damaged, incorrect, or faulty —
              contact us within 48 hours of delivery with your order
              number and a photo of the issue. For food-safety and
              regulatory reasons, correctly delivered, unopened alcohol
              cannot be returned for a change of mind once it has left
              our facility.
            </p>

            <H3>Food Central</H3>
            <p>
              Food is prepared to order and cannot be cancelled or
              refunded once preparation has started, except where the
              order arrived incorrect, or materially different from what
              you ordered — contact us within 2 hours of delivery.
            </p>

            <H3>How refunds are paid</H3>
            <p>
              Approved refunds are returned to your original payment
              method, typically within [X] business days of approval.
            </p>

            <H3>Failed or missed delivery</H3>
            <p>
              [Failed-delivery-attempt and re-delivery/cancellation-cutoff
              policy — pending business decision.]
            </p>
          </Section>

          <Section id="cookies" title="Cookie Policy">
            <p>
              Cookies are small files stored in your browser. We use them
              for the following, and only these:
            </p>
            <ul className="ml-5 flex list-disc flex-col gap-2 marker:text-text-muted">
              <li>
                <span className="font-medium text-text-primary">Strictly necessary</span>
                {" — "}keeping you signed in, remembering your cart, and
                remembering that you confirmed you&apos;re 18 or older
                (<code>lc_age_verified</code>) so you aren&apos;t asked on
                every page. The site can&apos;t function without these,
                so they can&apos;t be turned off individually.
              </li>
              <li>
                <span className="font-medium text-text-primary">Region &amp; preferences</span>
                {" — "}remembering your delivery region so pricing and
                availability are correct.
              </li>
            </ul>
            <p>
              We do not currently use third-party advertising or
              analytics cookies. If that changes, this policy — and a
              cookie-consent control — will be updated before it does,
              not after.
            </p>
            <p>
              You can block or delete cookies in your browser settings at
              any time; doing so may sign you out or clear your cart.
            </p>
          </Section>

          <p className="border-t border-divider pt-8 text-[13px] text-text-muted">
            Questions about any of this? Contact us at{" "}
            <span className="whitespace-nowrap">[support email]</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
