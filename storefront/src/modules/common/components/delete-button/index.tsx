import { deleteLineItem } from "@lib/data/cart"
import { Spinner, Trash } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { useState } from "react"

const DeleteButton = ({
  id,
  children,
  className,
  "aria-label": ariaLabel,
}: {
  id: string
  children?: React.ReactNode
  className?: string
  /**
   * 06_CART_SPECIFICATION.md §23 — "every remove action is labeled
   * specifically... never a bare icon with no accessible name." Required
   * whenever `children` doesn't already supply visible text (e.g. an
   * icon-only usage) — callers with a real product name in scope should
   * pass something like `Remove ${productName}`, not a generic "Remove."
   */
  "aria-label"?: string
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    await deleteLineItem(id).catch((_err) => {
      setIsDeleting(false)
    })
  }

  return (
    <div
      className={clx(
        "flex items-center justify-between text-small-regular",
        className
      )}
    >
      <button
        className="flex gap-x-1 text-ui-fg-subtle hover:text-ui-fg-base cursor-pointer"
        onClick={() => handleDelete(id)}
        aria-label={!children ? ariaLabel : undefined}
      >
        {isDeleting ? <Spinner className="animate-spin" /> : <Trash />}
        {children && <span>{children}</span>}
      </button>
    </div>
  )
}

export default DeleteButton
