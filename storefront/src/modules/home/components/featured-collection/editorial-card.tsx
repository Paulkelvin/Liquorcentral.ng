import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { Campaign } from "./campaign"
import { CARD_SHELL } from "./card-shell"

/**
 * The editorial card: a full-bleed photograph with the copy sitting on it.
 *
 * **Not a coloured rectangle with text.** The photograph fills the card edge
 * to edge and does the storytelling; the copy only points at where to go.
 *
 * Two things here are load-bearing rather than stylistic:
 *
 * 1. **The scrim is a two-stop gradient, not a flat overlay.** A uniform
 *    `bg-black/40` would dim the whole photograph — including the part doing
 *    the selling — to protect text that only occupies the bottom third. This
 *    gradient is transparent across the top two-thirds and only deepens
 *    behind the words, so the image keeps its contrast where nobody is
 *    reading. It is also why the scrim is dark rather than tinted: any brand
 *    colour laid over a photograph shifts its skin tones and wine reds.
 *
 * 2. **The whole card is one link, and the CTA is a `<span>`, not a nested
 *    `<a>`.** A link inside a link is invalid HTML and axe flags it as
 *    `nested-interactive`; the CTA reads as a button because it is styled as
 *    one and the card announces itself once to a screen reader.
 *
 * **This card has no aspect ratio of its own.** It takes its height from the
 * product cards beside it, via the row's `align-items: stretch` and the
 * `h-full` in `CARD_SHELL` — that is what makes every top and bottom edge in
 * the track line up. Giving it back an `aspect-[…]` would immediately
 * un-align the row, because a fixed ratio on a fixed width is a fixed height
 * and the product cards' height is content-driven. Only `min-h` is set, as a
 * floor for the copy.
 */
export default function EditorialCard({ campaign }: { campaign: Campaign }) {
  const href = campaign.href ?? `/collections/${campaign.collectionHandle}`

  return (
    <LocalizedClientLink
      href={href}
      className={`${CARD_SHELL} flex min-h-[280px] w-[280px] xsmall:w-[360px] small:w-[520px] medium:w-[560px]`}
      data-testid="editorial-card"
    >
      <Image
        src={campaign.image}
        alt={campaign.imageAlt}
        fill
        sizes="(max-width: 512px) 280px, (max-width: 1024px) 360px, 560px"
        // Slower and shallower than a typical hover zoom: 700ms and 3%. A
        // fast or deep zoom on a photograph this large reads as a web
        // banner, which is the opposite of the calm the section is after.
        className="object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.03]"
        priority={false}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(16,16,16,0.86) 0%, rgba(16,16,16,0.55) 28%, rgba(16,16,16,0.10) 58%, rgba(16,16,16,0) 78%)",
        }}
      />

      <div className="relative mt-auto flex flex-col items-start gap-2 p-6 small:p-8">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/75">
          {campaign.eyebrow}
        </span>
        <h3 className="font-display text-[26px] font-semibold leading-[1.1] tracking-[-0.01em] text-white small:text-[34px]">
          {campaign.title}
        </h3>
        <p className="max-w-[34ch] text-body text-white/85">
          {campaign.description}
        </p>
        <span className="mt-3 inline-flex items-center gap-2 border-b border-white/40 pb-1 text-caption font-medium text-white transition-colors duration-standard ease-in-out group-hover:border-white">
          {campaign.ctaLabel}
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="h-3.5 w-3.5 transition-transform duration-standard ease-in-out group-hover:translate-x-0.5"
          >
            <path
              d="M4 10h12m0 0-4.5-4.5M16 10l-4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </LocalizedClientLink>
  )
}
