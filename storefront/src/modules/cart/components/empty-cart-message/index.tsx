import { ShoppingBag } from "@medusajs/icons"
import { Heading, Text } from "@modules/common/components/ui"

import InteractiveLink from "@modules/common/components/interactive-link"

/**
 * Design Audit Phase 4 roadmap item 17 ("Empty states — warm, branded...
 * for zero-product, empty cart") — adds the same ShoppingBag mark the
 * header's own cart trigger uses (a considered, on-brand icon, not a
 * generic illustration), so the empty cart reads as a designed state
 * rather than a bare text fallback.
 */
const EmptyCartMessage = () => {
  return (
    <div className="py-32 small:py-48 px-2 flex flex-col justify-center items-start" data-testid="empty-cart-message">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-ink-100 text-text-secondary mb-6" aria-hidden="true">
        <ShoppingBag className="w-6 h-6" />
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
        Cart
      </Heading>
      <Text className="text-body mt-4 mb-6 max-w-[32rem]">
        You don&apos;t have anything in your cart. Let&apos;s change that, use
        the link below to start browsing our products.
      </Text>
      <div>
        <InteractiveLink href="/store">Explore products</InteractiveLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
