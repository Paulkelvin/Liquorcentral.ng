import { AbstractNotificationProviderService } from "@medusajs/framework/utils"
import { NotificationTypes, Logger } from "@medusajs/framework/types"
import { Resend } from "resend"

type Options = {
  api_key: string
  from: string
}

type InjectedDependencies = {
  logger: Logger
}

class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "resend"

  protected logger_: Logger
  protected client_: Resend
  protected from_: string

  constructor({ logger }: InjectedDependencies, options: Options) {
    super()
    this.logger_ = logger
    this.client_ = new Resend(options.api_key)
    this.from_ = options.from
  }

  static validateOptions(options: Record<string, unknown>): void {
    if (!options.api_key) {
      throw new Error("Resend api_key is required")
    }
    if (!options.from) {
      throw new Error("Resend from address is required")
    }
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    const subject = (notification.data?.subject as string) ||
      (notification.content?.subject as string) ||
      notification.template

    const html = (notification.content?.html as string) ||
      (notification.data?.html as string) ||
      this.buildHtml(notification)

    const { data, error } = await this.client_.emails.send({
      from: (notification.from as string) || this.from_,
      to: notification.to,
      subject,
      html,
    })

    if (error) {
      this.logger_.error(`Resend send failed: ${error.message}`)
      throw new Error(error.message)
    }

    return { id: data?.id }
  }

  private buildHtml(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): string {
    const data = notification.data || {}

    if (notification.template === "invite-user" || notification.template?.includes("invite")) {
      const inviteLink = (data.inviteLink as string) || (data.invite_link as string) || ""
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You've been invited to LiquorCentral Admin</h2>
          <p>You've been invited to join the LiquorCentral admin team.</p>
          <p>Click the link below to accept your invitation and set up your account:</p>
          <p><a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px;">Accept Invitation</a></p>
          <p style="color: #666; font-size: 12px;">If the button doesn't work, copy and paste this link: ${inviteLink}</p>
        </div>
      `
    }

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${notification.template}</h2>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </div>
    `
  }
}

export default ResendNotificationProviderService
