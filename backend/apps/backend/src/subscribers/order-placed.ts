import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type { IOrderModuleService, INotificationModuleService } from "@medusajs/framework/types"

/**
 * `MEDUSA_EXTENSIONS.md` #5 / `07_CHECKOUT_SPECIFICATION.md` §17 — the
 * order-confirmation email, the first and most fundamental proactive
 * communication this platform owes a customer once an order is placed.
 * Fires on Medusa's own native `order.placed` event — no custom event or
 * workflow hook needed. Sends only when the email notification provider
 * is actually registered (see `medusa-config.ts`'s conditional
 * registration); until `SENDGRID_API_KEY`/`SENDGRID_FROM` are supplied,
 * this subscriber runs and logs, but has no channel to send through, so
 * it fails loudly in the log rather than silently pretending to succeed.
 *
 * Uses the SendGrid provider's raw `content` (subject/html) path rather
 * than a SendGrid Dynamic Template ID — no template needs to be
 * pre-created in SendGrid's own dashboard for this to work.
 */
export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderModuleService: IOrderModuleService = container.resolve(
    Modules.ORDER
  )
  const notificationModuleService: INotificationModuleService =
    container.resolve(Modules.NOTIFICATION)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const order = await orderModuleService.retrieveOrder(data.id, {
    relations: ["items"],
  })

  if (!order.email) {
    return
  }

  const itemsHtml = (order.items ?? [])
    .map(
      (item) =>
        `<li>${item.quantity} &times; ${item.product_title ?? item.title}</li>`
    )
    .join("")

  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: "email",
      template: "order-confirmation",
      data: {},
      content: {
        subject: `Order #${order.display_id} confirmed — LiquorCentral`,
        html: `
          <p>Thank you for your order.</p>
          <p>Order number: <strong>#${order.display_id}</strong></p>
          <ul>${itemsHtml}</ul>
          <p>We'll let you know as your order progresses.</p>
        `,
      },
    })
  } catch (error) {
    logger.error(
      `Failed to send order confirmation email for order ${order.id}: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
