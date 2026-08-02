/**
 * The house icon set.
 *
 * **Why this exists.** The chrome — hamburger, bag, account, search — was
 * drawn from `@medusajs/icons`, and Paul's note was that it read "too bold and
 * not classic" next to the serif wordmark. He is right, and the cause is
 * measurable rather than a matter of taste: Medusa's icons are drawn on a
 * **15×15** viewBox with a **1.5** stroke, which is 10% of the box. Every icon
 * this project drew by hand — the category row, the trust band — uses a
 * **24×24** box at 1.5, which is 6.25%. So at the same rendered size the
 * borrowed icons came out roughly **1.6× heavier** than our own, and the
 * header was the one place the two sat side by side.
 *
 * So the fix is not "find thinner icons", it is a single specification that
 * everything is drawn to:
 *
 *   • 24×24 viewBox, always.
 *   • `STROKE` below, always. No filled shapes anywhere — a filled glyph next
 *     to an outlined one is the other way icon sets stop looking like a set.
 *   • Round caps and joins, `currentColor`, `fill="none"`.
 *   • Geometry inset ~2px from the box edge, so icons of different silhouettes
 *     have the same optical size rather than the same bounding box.
 *
 * **1.25, not 1.5.** At the 24px the header renders these at, 1.5 was still
 * the weight of a UI toolkit rather than of a wine merchant. 1.25 is thin
 * enough to read as drawn rather than generated, and stays above the hairline
 * that disappears on a low-DPI screen. It is a single constant here precisely
 * so this judgement can be revisited in one place.
 */

const STROKE = 1.25

type IconProps = {
  className?: string
  /** Rendered box in px. Defaults to 24 — the size the header uses. */
  size?: number
}

function Icon({
  className,
  size = 24,
  children,
  ...rest
}: IconProps & { children: React.ReactNode } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      {children}
    </svg>
  )
}

/* ---------------------------------------------------------------- chrome */

/**
 * Three fine rules, full width. The set this replaces drew them shorter and
 * much heavier, which is most of what made the header look like a toolbar.
 */
export function IconMenu(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 7h17" />
      <path d="M3.5 12h17" />
      <path d="M3.5 17h17" />
    </Icon>
  )
}

export function IconClose(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </Icon>
  )
}

export function IconSearch(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="10.75" cy="10.75" r="6.25" />
      <path d="M15.5 15.5 20 20" />
    </Icon>
  )
}

export function IconAccount(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="3.75" />
      {/* An open arc, not a closed body: it reads as shoulders rather than as
          a solid torso, which is what keeps it light at 24px. */}
      <path d="M4.75 20.25a7.25 7.25 0 0 1 14.5 0" />
    </Icon>
  )
}

/**
 * A tote, deliberately — slightly tapered sides and a fine handle arc. The
 * previous bag was a squared-off shape with a heavy top loop, and at 24px the
 * loop closed up into a blob.
 */
export function IconBag(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5.25 8h13.5l-1.1 11.4a1.4 1.4 0 0 1-1.4 1.35H7.75a1.4 1.4 0 0 1-1.4-1.35L5.25 8Z" />
      <path d="M9.25 8V6.5a2.75 2.75 0 0 1 5.5 0V8" />
    </Icon>
  )
}

export function IconChevronDown(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6.5 9.75 5.5 5.5 5.5-5.5" />
    </Icon>
  )
}

export function IconArrowRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 12h15" />
      <path d="m13.75 6.25 5.75 5.75-5.75 5.75" />
    </Icon>
  )
}

/* ------------------------------------------------------------ categories */

/**
 * One glyph per top-level category.
 *
 * **These moved here from `category-browse`, and the move is the point.** The
 * mobile drawer was picking its category icons out of `@medusajs/icons` — a
 * *beaker* for wines, a *flame* for spirits, a *database* for beer. So the
 * same category had two different icons depending on which surface you were
 * looking at, and one of the two was wrong about what it was selling. Both
 * surfaces now read from this map.
 */
const CATEGORY_GLYPHS: Record<string, React.ReactNode> = {
  wines: (
    <>
      <path d="M9 3h6v5a3 3 0 0 1-3 3 3 3 0 0 1-3-3V3Z" />
      <path d="M12 11v7" />
      <path d="M9 21h6" />
    </>
  ),
  // A flute, not a wine glass: tall and narrow, which is the only thing
  // distinguishing it from `wines` at this size. An earlier version added
  // bubble ticks beside the bowl and they read as a flag on a pole.
  champagne: (
    <>
      <path d="M9.5 3h5l-.6 8.5a1.9 1.9 0 0 1-3.8 0L9.5 3Z" />
      <path d="M12 13.5V20" />
      <path d="M9.5 20h5" />
    </>
  ),
  spirits: (
    <>
      <path d="M10 2h4v3l3 5v10a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V10l3-5V2Z" />
      <path d="M7 13h10" />
    </>
  ),
  beer: (
    <>
      <path d="M5 8h11v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8Z" />
      <path d="M16 10h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2" />
      <path d="M5 8a3 3 0 0 1 3-3 3 3 0 0 1 5-1 3 3 0 0 1 3 4" />
    </>
  ),
  // Simplified: the ribbon bow was four curves meeting at a point and, at the
  // stroke weight this set now uses, closed into a dark knot. A band and a
  // lid line carry "gift" on their own.
  "gift-sets": (
    <>
      <path d="M3.5 11h17v8.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V11Z" />
      <path d="M2.5 7h19v4h-19z" />
      <path d="M12 7v13.5" />
    </>
  ),
  // A corkscrew: winged handle, shaft, helix. The previous attempt was a
  // stemmed shape with two uprights and read unmistakably as a plug.
  accessories: (
    <>
      <path d="M12 3v5" />
      <path d="M7.5 5.5h9" />
      <path d="M12 8v3" />
      <path d="M12 11c1.8 0 1.8 2 0 2s-1.8 2 0 2 1.8 2 0 2-1.8 2 0 2" />
    </>
  ),
  "food-central": (
    <>
      <path d="M3 12h18a9 9 0 0 1-18 0Z" />
      <path d="M2 20h20" />
      <path d="M9 8c0-1.5 1-2 1-3.5" />
      <path d="M13 8c0-1.5 1-2 1-3.5" />
    </>
  ),
}

/** A handle this file has no glyph for still renders — as a wine glass. */
const FALLBACK_GLYPH = CATEGORY_GLYPHS.wines

export function CategoryIcon({
  handle,
  className,
  size,
}: IconProps & { handle: string }) {
  return (
    <Icon aria-hidden="true" className={className} size={size}>
      {CATEGORY_GLYPHS[handle] ?? FALLBACK_GLYPH}
    </Icon>
  )
}

/* ------------------------------------------------------- food navigation */

/** A cloche — the Food Central menu. */
export function IconCloche(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 16a8.5 8.5 0 0 1 17 0Z" />
      <path d="M2.5 19.5h19" />
      <path d="M12 7.5v-2" />
    </Icon>
  )
}

/** A calendar — scheduled orders. */
export function IconCalendar(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="5.5" width="17" height="15" rx="1.5" />
      <path d="M3.5 10h17" />
      <path d="M8 3.5v4" />
      <path d="M16 3.5v4" />
    </Icon>
  )
}

/** A shopfront — pickup. */
export function IconStorefront(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 10.5v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9" />
      <path d="M2.75 10.5 4.5 4.5h15l1.75 6a2.75 2.75 0 0 1-4.75 1.9 2.75 2.75 0 0 1-4.5 0 2.75 2.75 0 0 1-4.5 0 2.75 2.75 0 0 1-4.75-1.9Z" />
    </Icon>
  )
}
