"use client"

import { Dialog, Transition } from "@headlessui/react"
import { Fragment, useState } from "react"
import { Button, Text } from "@modules/common/components/ui"
import { AGE_GATE_COOKIE_NAME as COOKIE_NAME } from "./constants"

/**
 * 02_HOMEPAGE_SPECIFICATION.md §8.2 — a first-visit interstitial, not a
 * scrollable section. "Shown once per session (exact persistence duration
 * is an open item...)" — this specification assumes a site-wide gate on
 * first visit as the simpler, conservative default (§24), so a
 * session-scoped cookie (no `max-age`, expires when the browser session
 * ends) is the literal, non-inventive reading of "once per session."
 *
 * `initiallyVerified` is read from the incoming request's cookie header
 * by the server-rendered parent (`AgeGateWrapper`) so the very first
 * paint already knows whether to show the gate — avoiding a flash of the
 * gate on every return visit.
 *
 * **`onClose` is deliberately a no-op.** Headless UI's `Dialog` calls it
 * for both `Escape` and an outside click; §8.2 is explicit that "`Escape`
 * does not silently bypass a legal gate." Since visibility is otherwise
 * fully controlled by this component's own `open` state, an ignored
 * `onClose` means the dialog cannot be dismissed except through the two
 * explicit actions below — full keyboard/dialog semantics (focus trap,
 * `aria-modal`) are still provided by `Dialog`, only the dismiss paths
 * are intentionally disabled.
 */
export default function AgeGate({
  initiallyVerified,
}: {
  initiallyVerified: boolean
}) {
  const [open, setOpen] = useState(!initiallyVerified)
  const [declined, setDeclined] = useState(false)

  const confirm = () => {
    document.cookie = `${COOKIE_NAME}=true; path=/; SameSite=Strict`
    setOpen(false)
  }

  const decline = () => {
    setDeclined(true)
  }

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-overlay backdrop-blur-md"
            aria-hidden="true"
          />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                data-testid="age-gate"
                className="w-full max-w-xs rounded-radius-lg bg-surface-elevated p-6 text-left shadow-elevation-3"
              >
                {declined ? (
                  <>
                    <Dialog.Title
                      as="h2"
                      className="font-display text-heading-3 font-medium leading-snug text-text-primary mb-2"
                    >
                      Age restricted
                    </Dialog.Title>
                    <Text size="caption" muted>
                      You must be of legal drinking age to access
                      LiquorCentral.
                    </Text>
                  </>
                ) : (
                  <>
                    <Dialog.Title
                      as="h2"
                      className="font-display text-heading-3 font-medium leading-snug text-text-primary mb-2"
                    >
                      Welcome to LiquorCentral
                    </Dialog.Title>
                    <Text size="caption" muted className="mb-5">
                      You must be of legal drinking age to enter this site.
                      Please confirm your age.
                    </Text>
                    <div className="flex flex-col gap-2">
                      {/* A dark charcoal fill rather than the loud brand
                          accent color — this modal's "refined classic"
                          aesthetic deliberately steps outside the shared
                          Button variants' color/radius, so the color and
                          radius are overridden with `!` (important)
                          utilities rather than relying on className
                          ordering, which Tailwind doesn't guarantee wins
                          against the component's own hardcoded classes. */}
                      <Button
                        onClick={confirm}
                        className="w-full !rounded-[4px] !bg-ink-900 !text-surface-elevated hover:!bg-ink-700 active:!bg-ink-900"
                        data-testid="age-gate-confirm"
                      >
                        I am 18 or older
                      </Button>
                      <Button
                        onClick={decline}
                        variant="secondary"
                        className="w-full !rounded-[4px] !border !border-border !bg-transparent !text-text-secondary hover:!text-text-primary"
                        data-testid="age-gate-decline"
                      >
                        I am under 18
                      </Button>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
