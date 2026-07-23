import { deleteLineItem } from "@lib/data/cart"
import { Spinner, Trash } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { useState } from "react"

const DeleteButton = ({
  id,
  children,
  className,
  itemName,
  "data-testid": dataTestId,
}: {
  id: string
  children?: React.ReactNode
  className?: string
  /**
   * 06_CART_SPECIFICATION.md §23 — "every remove action is labeled
   * specifically (e.g. 'Remove [product name]'), never a bare icon with
   * no accessible name." Falls back to a still-generic "Remove item"
   * only where no product name is genuinely available.
   */
  itemName?: string
  "data-testid"?: string
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
        className="flex gap-x-1 text-ui-fg-subtle hover:text-ui-fg-base cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        onClick={() => handleDelete(id)}
        aria-label={`Remove ${itemName || "item"}`}
        disabled={isDeleting}
        data-testid={dataTestId}
      >
        {isDeleting ? <Spinner className="animate-spin" /> : <Trash />}
        <span aria-hidden="true">{children}</span>
      </button>
    </div>
  )
}

export default DeleteButton
