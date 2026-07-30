"use client"

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react"
import { Trash, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"
import { useCart } from "@lib/context/cart-context"
import {
  isFoodCentralItem,
  splitGiftWrapLines,
} from "@lib/util/cart-fulfillment"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import QuantityStepper from "@modules/products/components/quantity-stepper"
import { clx } from "@modules/common/components/ui"

/**
 * The platform's primary cart surface: a right-anchored side sheet that
 * opens from the nav icon and after every add-to-cart, so adding an item
 * never costs a navigation.
 *
 * Headless UI's `Dialog` rather than a hand-rolled overlay — it brings
 * the focus trap, Escape handling, click-outside and body scroll lock
 * that a cart drawer needs and that the previous hover popover never
 * had. `/cart` still exists as a real page: it owns stock re-validation
 * and the quantity auto-adjustment notices, which a drawer opened
 * mid-browse is the wrong place to deliver.
 */
export default function CartDrawer() {
  const { cart, isDrawerOpen, closeDrawer, setQuantity, isPending } = useCart()

  const { productLines, giftWrapByParent } = splitGiftWrapLines(
    cart?.items ?? []
  )
  const wineLines = productLines.filter((item) => !isFoodCentralItem(item))
  const foodLines = productLines.filter((item) => isFoodCentralItem(item))
  const currencyCode = cart?.currency_code ?? "ngn"
  const isEmpty = productLines.length === 0

  const renderLine = (item: HttpTypes.StoreCartLineItem) => (
    <li key={item.id} className="flex gap-4 py-5" data-testid="cart-item">
      {/* `self-stretch` + a fixed width, rather than a fixed square: the
          photo then spans the full height of the title/variant/price stack
          beside it, so the two columns read as one block instead of a
          small icon floating beside a taller column of text. */}
      <LocalizedClientLink
        href={`/products/${item.product_handle}`}
        onClick={closeDrawer}
        className="block w-20 shrink-0 self-stretch"
        aria-label={`View ${item.product_title || item.title || "product"}`}
      >
        <Thumbnail
          thumbnail={item.thumbnail}
          images={item.variant?.product?.images}
          size="square"
          className="!h-full"
          alt={item.title || item.product_title || "Product photo"}
        />
      </LocalizedClientLink>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {/* Below `small` the price drops onto its own line rather than
            sitting beside the title. In a ~340px drawer on a phone, a
            price on the title's row leaves it about 85px to wrap in,
            which turned "Château Margaux 2015" into three lines and made
            the whole row read as cramped — measured, not assumed. With
            the full width to itself the title holds one or two lines. */}
        <div className="flex flex-col gap-1 small:flex-row small:items-start small:justify-between small:gap-3">
          <div className="min-w-0">
            <LocalizedClientLink
              href={`/products/${item.product_handle}`}
              onClick={closeDrawer}
              className="block text-[15px] font-semibold leading-snug text-text-primary hover:text-primary"
              data-testid="product-link"
            >
              {item.product_title}
            </LocalizedClientLink>
            {/* `[&_p]` because LineItemOptions renders a <Text>, which
                hardcodes 16px — at that size the variant competed with
                the product name and pushed the title to three lines in
                a 340px panel. `showLabel={false}` drops the "Variant:"
                prefix: directly beneath the title, the bottle size speaks
                for itself. */}
            <div className="mt-0.5 [&_p]:!text-caption [&_p]:leading-snug">
              <LineItemOptions
                variant={item.variant}
                showLabel={false}
                data-testid="cart-item-variant"
              />
            </div>
          </div>
          {/* `LineItemPrice` hardcodes `items-end` on its own wrapper, which
              is right for the desktop row (price flush to the panel edge,
              under the subtotal) but wrong once the price stacks onto its
              own line on a phone — there it floated off to the right of
              the title and variant it belongs to. `[&>div]` re-anchors it
              to the left below `small`, so the stacked price starts on the
              same edge as the text above it, and restores `items-end` at
              the breakpoint where the row layout takes over. Scoped here
              rather than changed in `LineItemPrice` itself, which the cart
              page and order confirmation also render. */}
          <div
            className="shrink-0 whitespace-nowrap text-[14px] font-medium text-text-primary [&>div]:items-start small:[&>div]:items-end"
            data-testid="cart-item-price"
          >
            <LineItemPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          {/* `min={0}` so the decrement button removes the line at zero,
              matching the cart page's own behaviour (§7). `size="compact"`
              draws a lower-profile pill without shrinking its 44px tap
              target — see QuantityStepper's own note. */}
          <QuantityStepper
            quantity={item.quantity}
            onChange={(quantity) => setQuantity(item.id, quantity)}
            min={0}
            hideLabel
            size="compact"
          />
          {/* Icon, not a text link — at this density "Remove" competed with
              the product title for attention. The icon keeps a real
              accessible name (naming the product, so a screen-reader user
              hears *which* line it removes) and a full 44px tap target,
              and stays clear of the "+" button rather than sitting one
              mis-tap away from it. */}
          <button
            type="button"
            onClick={() => setQuantity(item.id, 0)}
            aria-label={`Remove ${item.product_title || item.title || "item"} from cart`}
            title="Remove"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-radius-md text-text-muted transition-colors duration-standard ease-in-out hover:bg-ink-100 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            data-testid="cart-item-remove-button"
          >
            <Trash />
          </button>
        </div>
      </div>
    </li>
  )

  const renderGroup = (
    title: string,
    lines: HttpTypes.StoreCartLineItem[]
  ) => {
    if (!lines.length) {
      return null
    }
    return (
      <section key={title}>
        {/* §5/§6 — the two fulfillment legs stay visually distinct here
            too, since this is now the surface most customers read their
            cart on. */}
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.05em] text-text-muted">
          {title}
        </h3>
        <ul className="divide-y divide-divider">{lines.map(renderLine)}</ul>
      </section>
    )
  }

  return (
    <Dialog
      open={isDrawerOpen}
      onClose={closeDrawer}
      className="relative z-[90]"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-overlay backdrop-blur-sm transition-opacity duration-300 ease-out data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-y-0 right-0 flex max-w-full">
          <DialogPanel
            transition
            // Never quite the full viewport: a full-width sheet leaves no
            // backdrop to tap, so on a phone the only way out would be
            // the close button. The 3rem gutter keeps tap-outside-to-
            // close working at every width.
            className="flex h-full w-[calc(100vw-3rem)] max-w-md transform flex-col bg-surface-elevated shadow-elevation-3 transition duration-300 ease-out data-[closed]:translate-x-full"
            data-testid="cart-drawer"
          >
            <header className="flex items-center justify-between gap-3 border-b border-divider px-5 py-4">
              <DialogTitle className="text-body-lg font-semibold text-text-primary">
                Your cart
              </DialogTitle>
              {/* `data-autofocus` so opening lands focus on a real
                  control. Without it Headless UI falls back to focusing
                  the dialog root, which reads as "nothing is focused" to
                  a keyboard user and leaves the first Tab landing
                  somewhere arbitrary. */}
              <button
                type="button"
                data-autofocus
                onClick={closeDrawer}
                aria-label="Close cart"
                className="-mr-2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-radius-md text-text-secondary transition-colors duration-standard ease-in-out hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                data-testid="cart-drawer-close"
              >
                <XMark />
              </button>
            </header>

            {isEmpty ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
                <p className="text-body text-text-secondary">
                  Your cart is empty.
                </p>
                <LocalizedClientLink
                  href="/store"
                  onClick={closeDrawer}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-radius-md bg-primary px-5 text-body font-medium text-surface-elevated transition-colors duration-standard ease-in-out hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
                >
                  Start shopping
                </LocalizedClientLink>
              </div>
            ) : (
              <>
                <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-4">
                  {renderGroup("Wine & Spirits", wineLines)}
                  {renderGroup("Food Central", foodLines)}
                  {giftWrapByParent.size > 0 && (
                    <p className="text-caption text-text-muted">
                      Gift wrap is included on the items you selected it for.
                    </p>
                  )}
                </div>

                {/* Sticky foot: the subtotal and the one action. Delivery
                    and tax are deliberately not shown — they are unknown
                    until an address and a delivery option exist at
                    checkout, and stating them here would claim more
                    certainty than the cart has (§6, §10). */}
                <footer className="border-t border-divider px-5 pb-5 pt-5">
                  {/* Subtotal and its figure share a weight and size here:
                      at a glance this row is one statement, not a small
                      label with a large number bolted to it. */}
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[17px] font-semibold leading-none text-text-primary">
                      Subtotal
                    </span>
                    <span
                      className={clx(
                        "text-[17px] font-semibold leading-none text-text-primary transition-opacity duration-standard",
                        isPending && "opacity-50"
                      )}
                      data-testid="cart-subtotal"
                      data-value={cart?.item_subtotal ?? 0}
                    >
                      {convertToLocale({
                        amount: cart?.item_subtotal ?? 0,
                        currency_code: currencyCode,
                      })}
                    </span>
                  </div>
                  <p className="mt-2 text-center text-caption text-text-secondary">
                    Delivery &amp; tax calculated at checkout
                  </p>
                  <LocalizedClientLink
                    href="/checkout?step=address"
                    onClick={closeDrawer}
                    className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center rounded-radius-md bg-primary px-6 text-body-lg font-medium text-surface-elevated transition-colors duration-standard ease-in-out hover:bg-primary-hover active:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
                    data-testid="cart-drawer-checkout-button"
                  >
                    Checkout
                  </LocalizedClientLink>
                  <LocalizedClientLink
                    href="/cart"
                    onClick={closeDrawer}
                    className="mt-4 block text-center text-caption text-text-secondary underline underline-offset-2 transition-colors duration-standard ease-in-out hover:text-text-primary"
                    data-testid="cart-drawer-view-cart"
                  >
                    View full cart
                  </LocalizedClientLink>
                </footer>
              </>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
