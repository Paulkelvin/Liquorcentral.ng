import { test, expect } from "@playwright/test"

/**
 * Browse -> cart -> checkout -> order confirmation, end to end against a
 * real running storefront + Medusa backend. This is the regression suite
 * every prior verification of this flow in this project's history never
 * became — see playwright.config.ts's own comment.
 *
 * Requires Postgres, Redis, a running Medusa backend, and a seeded
 * catalog with at least one in-stock Wine & Spirits product. Completes
 * the order against Medusa's system-default ("manual") payment provider,
 * since no real Paystack key is configured in this environment — see
 * ManualTestPaymentButton.
 *
 * Picks whichever in-stock product the store listing shows first rather
 * than a hardcoded handle: every successful run here places a real order
 * and permanently decrements that product's seeded stock, so pinning one
 * handle just means the suite eventually starts failing against its own
 * accumulated history once that product sells out — which is exactly
 * what happened once locally while building this test.
 */

test.describe("Wine & Spirits checkout", () => {
  test("guest can browse, add to cart, and complete an order", async ({
    page,
  }) => {
    await page.goto("/ng")

    // `.click()` retries against Playwright's own actionability checks
    // (visible, enabled, stable) for the given timeout, unlike a single
    // `isVisible()` snapshot — the gate's enter transition means a plain
    // snapshot taken a frame too early reads as "not visible" and skips
    // a dialog that's about to render, which then blocks every click
    // underneath it for the rest of the test.
    await page
      .getByTestId("age-gate-confirm")
      .click({ timeout: 5_000 })
      .catch(() => {
        // Already verified in this browser context — gate never rendered.
      })

    // --- Browse & add to cart ---
    await page.goto("/ng/store")
    const firstInStockCard = page
      .getByTestId("product-wrapper")
      .filter({ hasNot: page.getByTestId("product-unavailable-label") })
      .first()
    await expect(firstInStockCard).toBeVisible({ timeout: 15_000 })
    await firstInStockCard.click()

    // `product-title` also labels the related-products cards further down
    // this same page, so scope to the <h1> rather than matching all three.
    await expect(page.locator('h1[data-testid="product-title"]')).toBeVisible()

    const addButton = page.getByTestId("add-product-button")
    await expect(addButton).toBeEnabled({ timeout: 10_000 })
    await addButton.click()

    // Cart drawer opens on add (Phase 1 of the checkout refactor) and
    // shows the line item immediately via the optimistic cart. The
    // drawer renders its own markup rather than the shared `Item`
    // component the /cart page below uses, so it's `cart-item`, not
    // `product-row`.
    await expect(page.getByTestId("cart-item").first()).toBeVisible({
      timeout: 15_000,
    })

    // --- Cart page ---
    await page.goto("/ng/cart")
    await expect(page.getByTestId("product-row").first()).toBeVisible()
    await expect(page.getByTestId("cart-total")).toBeVisible()

    // --- Checkout: Contact step ---
    await page.getByTestId("checkout-button").click()
    await expect(page).toHaveURL(/\/checkout\?step=address/)

    const timestamp = Date.now()
    await page.getByTestId("shipping-first-name-input").fill("Test")
    await page.getByTestId("shipping-last-name-input").fill("Customer")
    await page.getByTestId("shipping-address-input").fill("1 Test Close")
    await page.getByTestId("shipping-city-input").fill("Lagos")
    await page.getByTestId("shipping-province-input").fill("Lagos")
    await page
      .getByTestId("shipping-email-input")
      .fill(`e2e-${timestamp}@example.com`)
    await page.getByTestId("shipping-phone-input").fill("+2348000000000")

    await page.getByTestId("submit-address-button").click()

    // --- Checkout: Payment step ---
    // Two-stage, matching the real flow: pick a payment method and
    // confirm it (creates the payment session), then a second, separate
    // button actually places the order — see payment/index.tsx's own
    // `readyToPlaceOrder` branch.
    await expect(page).toHaveURL(/step=payment/, { timeout: 10_000 })
    await page.getByRole("radio", { name: /manual payment/i }).click()

    const confirmMethod = page.getByTestId("submit-payment-button")
    await expect(confirmMethod).toBeEnabled({ timeout: 10_000 })
    await confirmMethod.click()

    const submitOrder = page.getByTestId("submit-order-button")
    await expect(submitOrder).toBeVisible({ timeout: 10_000 })
    await expect(submitOrder).toBeEnabled()
    await submitOrder.click()

    // --- Order confirmation ---
    await expect(page).toHaveURL(/\/order\/.+\/confirmed/, {
      timeout: 15_000,
    })
    await expect(page.getByText(/order/i).first()).toBeVisible()
  })
})
