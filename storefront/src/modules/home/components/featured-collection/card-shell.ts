/**
 * The shell every card in the Featured Collection row shares: radius,
 * border, resting shadow, and both hover behaviours.
 *
 * It lives in its own file so the editorial card and the product card
 * cannot drift apart. Paul's requirement is that the cards read as one
 * track — same top edge, same bottom edge, same depth, same lift — and
 * two independent copies of these classes is exactly how that stops being
 * true after the next edit to one of them.
 *
 * **`h-full` is load-bearing.** The row is a flex container at its default
 * `align-items: stretch`, so every `<li>` is already stretched to the
 * tallest card on the line; `h-full` is what makes the card inside the
 * `<li>` actually fill it. Remove it and the cards go back to being sized
 * by their own content, which is the ragged bottom edge this replaced.
 *
 * **The cards carry no resting shadow, deliberately.** They briefly used
 * `elevation-2` at rest — a wide, diffuse shadow that reads well on white
 * but, against this section's own tinted band, resolved into a visible grey
 * halo tracing every card. Paul saw it on a phone and asked for it gone.
 *
 * What separates a card from the band now is the **contrast step plus the
 * hairline border** — white card, `ink-100` ground, `ink-300` edge — which
 * is enough on its own and stays clean at any zoom. So do not reintroduce a
 * resting shadow "for depth": on a tinted ground it costs a halo and buys
 * nothing the contrast step isn't already providing.
 *
 * The hover state keeps `elevation-2` with the lift, since it only ever
 * appears under a pointer and reads as a response rather than as decoration.
 * That is also `DESIGN_SYSTEM.md` §B4's own hover step for a raised surface,
 * so nothing here deviates from the scale any more.
 */
export const CARD_SHELL =
  "group relative h-full shrink-0 overflow-hidden rounded-radius-lg border border-border transition-[box-shadow,transform] duration-standard ease-in-out hover:-translate-y-1 hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
