import { deleteLineItem } from "@lib/data/cart"
import { Spinner, Trash } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { useState } from "react"

const DeleteButton = ({
  id,
  children,
  className,
  variant = "icon",
  "aria-label": ariaLabel,
  onDelete,
  "data-testid": dataTestid,
}: {
  id: string
  children?: React.ReactNode
  className?: string
  /**
   * "text" drops the trash glyph and renders the label alone as a quiet
   * underlined action — used in the cart, where an icon sat too close to
   * the quantity stepper's "+" to be safe to tap.
   */
  variant?: "icon" | "text"
  /**
   * 06_CART_SPECIFICATION.md §23 — "every remove action is labeled
   * specifically... never a bare icon with no accessible name." Required
   * whenever `children` doesn't already supply visible text (e.g. an
   * icon-only usage) — callers with a real product name in scope should
   * pass something like `Remove ${productName}`, not a generic "Remove."
   */
  "aria-label"?: string
  /**
   * Optional override for a caller that already has its own optimistic
   * mutation path (the cart page's `Item`, via `useCart().removeItem`) —
   * when supplied, this component becomes a plain trigger and stops
   * managing its own request/spinner entirely, so the removal reads as
   * instant instead of waiting on this button's own round trip on top of
   * the caller's. Omit it and the component keeps its original
   * self-contained behaviour.
   */
  onDelete?: (id: string) => void
  /**
   * Forwarded onto the real `<button>`. Callers were already passing
   * one (`product-delete-button`), but this component never declared or
   * spread it, so it was silently dropped and the control was
   * unaddressable from a test or a console selector.
   */
  "data-testid"?: string
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    if (onDelete) {
      onDelete(id)
      return
    }
    setIsDeleting(true)
    await deleteLineItem(id).catch((_err) => {
      setIsDeleting(false)
    })
  }

  return (
    <div
      className={clx(
        "flex items-center justify-between text-caption",
        className
      )}
    >
      <button
        className={clx(
          "flex cursor-pointer items-center gap-x-1 text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
          variant === "text" && "text-xs underline underline-offset-2"
        )}
        onClick={() => handleDelete(id)}
        aria-label={!children ? ariaLabel : undefined}
        data-testid={dataTestid}
      >
        {isDeleting ? (
          <Spinner className="animate-spin" />
        ) : (
          variant === "icon" && <Trash />
        )}
        {children && <span>{children}</span>}
      </button>
    </div>
  )
}

export default DeleteButton
