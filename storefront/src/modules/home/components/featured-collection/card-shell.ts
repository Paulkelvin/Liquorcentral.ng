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
 * **On the shadow steps.** `DESIGN_SYSTEM.md` §B4's table assigns
 * `elevation-1` to product cards, but its own values are a tight
 * `0 1px 2px / 0 2px 6px` — which all but disappears against this
 * section's tinted background, and is not the "soft, diffused, wide blur"
 * Paul asked for. `elevation-2` (`0 4px 12px rgba(…,0.10), 0 12px 32px
 * rgba(…,0.08)`) is that shadow exactly, already in the scale. §B4
 * explicitly allows this ("exact shadow values are a reasonable starting
 * proposal… expect minor tuning once real screens exist"), so this steps
 * up the scale rather than inventing a shadow outside it.
 */
export const CARD_SHELL =
  "group relative h-full shrink-0 overflow-hidden rounded-radius-lg border border-border shadow-elevation-2 transition-[box-shadow,transform] duration-standard ease-in-out hover:-translate-y-1 hover:shadow-elevation-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
