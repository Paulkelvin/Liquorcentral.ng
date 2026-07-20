import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import type { Logger } from "@medusajs/framework/types"
import type {
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"

/**
 * `MEDUSA_EXTENSIONS.md` #5 — one of the two approved notification
 * channels (Email and WhatsApp, both mandatory, plus in-app;
 * `docs/DECISION_LOG.md` 2026-07-19). `docs/implementation-planning/
 * TIER_B_NOTIFICATION_PROVIDER_MODULE.md` remains Draft and deliberately
 * channel-agnostic — this is the concrete channel-integration work that
 * document explicitly defers to a future Tier D pass once a channel is
 * chosen. Built directly against Meta's WhatsApp Cloud API
 * (https://developers.facebook.com/docs/whatsapp/cloud-api), the current
 * standard integration path (no third-party BSP middleman required).
 *
 * **A real, load-bearing constraint, not an implementation detail to
 * gloss over**: WhatsApp only allows free-form text for a
 * customer-initiated conversation within a rolling 24-hour window.
 * Every notification this project sends is business-initiated (an order
 * confirmation, a status update), so every message here MUST use a
 * pre-approved WhatsApp message template — Meta rejects free text
 * outside that window. `notification.template` is the exact template
 * name already approved in the Meta Business Manager; `notification.data`
 * supplies the template's placeholder values, in the same order the
 * template itself defines them (WhatsApp templates are positional,
 * `{{1}}`, `{{2}}`, ... — there is no named-placeholder mechanism).
 * Getting a template approved is a real, separate process with its own
 * timeline (`MEDUSA_EXTENSIONS.md` #5's own named risk) — this module
 * does not shorten or bypass that.
 */

type Options = {
  accessToken: string
  phoneNumberId: string
  /** BCP-47 language code for every template, e.g. "en_US". */
  languageCode?: string
}

const GRAPH_API_VERSION = "v20.0"

class WhatsAppNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "whatsapp"

  protected logger_: Logger
  protected options_: Options

  static validateOptions(options: Record<string, unknown>) {
    if (!options.accessToken) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "A WhatsApp Cloud API access token is required (WHATSAPP_ACCESS_TOKEN)."
      )
    }
    if (!options.phoneNumberId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "A WhatsApp Cloud API phone number ID is required (WHATSAPP_PHONE_NUMBER_ID)."
      )
    }
  }

  constructor(cradle: { logger: Logger }, options: Options) {
    super()
    this.logger_ = cradle.logger
    this.options_ = options
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    if (!notification) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "No notification information provided"
      )
    }

    const parameters = Object.values(notification.data ?? {}).map((value) => ({
      type: "text",
      text: String(value),
    }))

    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${this.options_.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.options_.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: notification.to,
          type: "template",
          template: {
            name: notification.template,
            language: { code: this.options_.languageCode ?? "en_US" },
            components: parameters.length
              ? [{ type: "body", parameters }]
              : undefined,
          },
        }),
      }
    )

    const body = await response.json()

    if (!response.ok) {
      const errorMessage = body?.error?.message ?? response.statusText
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to send WhatsApp message: ${errorMessage}`
      )
    }

    return { id: body?.messages?.[0]?.id }
  }
}

export default WhatsAppNotificationProviderService
