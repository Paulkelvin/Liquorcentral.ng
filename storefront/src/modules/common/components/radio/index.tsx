import { clx } from "@modules/common/components/ui"

/**
 * Purely a visual indicator — every consumer (Shipping's method/pickup
 * radios, Payment's provider radio, the saved-address Listbox option)
 * nests this inside its own already-semantic interactive control
 * (Headless UI's `Radio`/`RadioGroupOption` or `Listbox.Option`, each
 * already `role="radio"`/selectable on its own). Rendering this as a
 * second, nested `<button role="radio">` — with `aria-checked` hardcoded
 * to `"true"` regardless of the real `checked` prop — was a genuine,
 * newly-surfaced accessibility bug: a `nested-interactive` violation plus
 * an accessible name axe-core only caught once a real Shipping Option
 * existed for the first time (`07_CHECKOUT_SPECIFICATION.md` Milestone).
 * Now a plain, `aria-hidden` decorative element, matching the icon-only
 * treatment already used elsewhere on the platform.
 */
const Radio = ({ checked, 'data-testid': dataTestId }: { checked: boolean, 'data-testid'?: string }) => {
  return (
    <span
      aria-hidden="true"
      data-state={checked ? "checked" : "unchecked"}
      className="group relative flex h-[18px] w-[18px] shrink-0 items-center justify-center outline-none"
      data-testid={dataTestId || 'radio-button'}
    >
      {/* Drawn, not inherited: a hairline ring that tightens to ink and
          fills with a solid inner dot when selected. The old treatment
          leaned on the Medusa preset's `shadow-borders-*` stack, which
          rendered as a soft grey blob at this size. */}
      <span
        className={clx(
          "flex h-[18px] w-[18px] items-center justify-center rounded-full border bg-surface-elevated transition-colors duration-standard ease-in-out",
          checked
            ? "border-ink-900 ring-1 ring-ink-900"
            : "border-divider group-hover:border-text-muted"
        )}
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-ink-900" />}
      </span>
    </span>
  )
}

export default Radio
