import { clx } from "@modules/common/components/ui"

/**
 * The gold accent system, in one place, in one rule:
 *
 * **Gold marks content a person curated — never a control a customer
 * operates.** Red is this platform's "act now" colour and green is its
 * "this is safe / this succeeded" colour; both already carry real
 * semantic weight on every add-to-cart button, every link, every success
 * state. Gold had no job of its own — an audit found it used in exactly
 * three places sitewide, one of them dead code — which is what made the
 * whole palette read as red-and-green-only, i.e. duller than a three-
 * colour brand should.
 *
 * The rule that keeps this from sprawling into "gold everywhere": it
 * only sits beside copy that is explicitly editorial — the Featured
 * Collection ("chosen by us, not by an algorithm"), the campaign banner
 * layered on top of it, a wine's own tasting notes. It never appears on
 * a button, a price, a badge, a stock/availability label, or anywhere
 * else a customer clicks or that states a fact they're relying on to
 * transact — gold competing with red on a control would blur the one
 * signal that has to stay unambiguous ("this is the button").
 *
 * `CuratedMark` is the visual unit that carries the rule: a short, thick
 * rule sitting above or beside a heading, never the heading's own text
 * colour (legibility and hierarchy stay with `text-primary`/white, as
 * before — this is decoration, not a restyle).
 */
export function CuratedMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={clx("inline-block h-[3px] w-8 rounded-radius-full bg-accent", className)}
    />
  )
}
