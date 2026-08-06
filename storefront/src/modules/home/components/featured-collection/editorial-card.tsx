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
 * **This card sets its own height, and that is a change.** It used to take its
 * height from the product cards beside it in a horizontally-scrolling track,
 * via `align-items: stretch` and the `h-full` in `CARD_SHELL`. The track is
 * gone — it is now a full-width banner spanning the grid's first row, with
 * nothing beside it to inherit from — so the height has to come from
 * somewhere, and `min-h` is that floor.
 *
 * `min-h` rather than `aspect-[…]` on purpose: at full container width a fixed
 * ratio makes this card enormous on desktop (a 21:9 crop of a 1280px column is
 * still 550px tall) and the copy inside is what actually needs the room. The
 * floor grows in two steps instead, and the photograph fills whatever it
 * settles on.
 */
export default function EditorialCard({ campaign }: { campaign: Campaign }) {
  const href = campaign.href ?? `/collections/${campaign.collectionHandle}`

  return (
    <LocalizedClientLink
      href={href}
      className={`${CARD_SHELL} flex min-h-[300px] w-full small:min-h-[360px]`}
      data-testid="editorial-card"
    >
      <Image
        src={campaign.image}
        alt={campaign.imageAlt}
        fill
        // Full container width now that this is a banner, not a track item.
        sizes="(max-width: 1024px) 100vw, 1280px"
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
        {/* Hidden below `small:` — Paul's own read of the mobile card:
            eyebrow, title and CTA already say enough, and this sentence
            was the difference between a quick scan and something that
            asked to be read. Kept for desktop, where the card has more
            room to spare and reads as a proper editorial banner. */}
        <p className="hidden max-w-[34ch] text-body text-white/85 small:block">
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
