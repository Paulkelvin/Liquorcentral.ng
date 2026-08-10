import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

const ADMIN_URL =
  process.env.MEDUSA_ADMIN_URL ||
  process.env.MEDUSA_BACKEND_URL ||
  "http://localhost:9000"

export default async function inviteCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }[]>) {
  const logger = container.resolve("logger")
  const userService = container.resolve(Modules.USER)
  const notificationService = container.resolve(Modules.NOTIFICATION)

  const invites = Array.isArray(data) ? data : [data]

  for (const { id } of invites) {
    try {
      const invite = await userService.retrieveInvite(id)
      const inviteLink = `${ADMIN_URL}/app/invite?token=${invite.token}`

      await notificationService.createNotifications({
        to: invite.email,
        channel: "email",
        template: "invite-user",
        data: {
          inviteLink,
          emailAddress: invite.email,
        },
      })

      logger.info(`[invite] Sent invitation email to ${invite.email}`)
    } catch (err: any) {
      logger.error(`[invite] Failed to send invite ${id}: ${err.message}`)
    }
  }
}

export const config: SubscriberConfig = {
  event: ["invite.created", "invite.resent"],
}
