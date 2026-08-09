import { ShoppingBag } from "@medusajs/icons"
import { buttonClasses, Heading, Text } from "@modules/common/components/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * Design Audit Phase 4 roadmap item 17 ("Empty states — warm, branded...
 * for zero-product, empty cart") — adds the same ShoppingBag mark the
 * header's own cart trigger uses (a considered, on-brand icon, not a
 * generic illustration), so the empty cart reads as a designed state
 * rather than a bare text fallback.
 */
const EmptyCartMessage = () => {
  return (
    /* `py-16 small:py-24`, down from `py-32 small:py-48`. At 128px on a
       phone the bag icon sat below the fold's midpoint with nothing above
       it, so the page opened on a screenful of empty ground before saying
       anything — a lot of blank to scroll past to reach four lines of
       content and a link. */
    <div
      className="flex flex-col items-start justify-center px-2 py-16 small:py-24"
      data-testid="empty-cart-message"
    >
      <div
        className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-ink-100 text-text-secondary"
        aria-hidden="true"
      >
        <ShoppingBag className="h-6 w-6" />
      </div>
      {/* Was a fixed `text-heading-1` (39px) at every width — also larger
          than the filled cart's own "Your cart" heading (`text-heading-3`,
          25px) for what is conceptually the same page title. Brought both
          to the same scale: smaller on mobile, matching size from
          `small:` up. */}
      <Heading
        level="h1"
        className="flex flex-row items-baseline gap-x-2 !text-[22px] small:!text-heading-3"
      >
        Your cart is empty
      </Heading>
      {/* The previous copy ("Let's change that, use the link below to
          start browsing our products") was a comma splice, and it
          described the interface instead of just being it — a line of
          text whose whole job is to point at the control underneath it
          isn't doing any work the control can't do itself. */}
      <Text className="mt-4 mb-6 max-w-[32rem] text-body">
        Everything here is stocked, sold and delivered by us — never a
        third-party seller.
      </Text>
      {/* Two destinations, not one. The site sells from two departments
          and the empty cart previously offered only Liquor, which is the
          one moment a customer has stated no preference at all. Food
          Central takes the quieter treatment purely because Liquor ships
          nationwide while Food Central is Lagos-only, so it is the safer
          default for an unknown visitor. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <LocalizedClientLink
          href="/store"
          data-testid="empty-cart-shop-liquor"
          className={buttonClasses({ className: "w-full sm:w-auto" })}
        >
          Shop Liquor
        </LocalizedClientLink>
        <LocalizedClientLink
          href="/food-central"
          data-testid="empty-cart-shop-food"
          className={buttonClasses({
            variant: "secondary",
            className: "w-full sm:w-auto",
          })}
        >
          Order from Food Central
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
