import {
  AbstractPaymentProvider,
  MedusaError,
  BigNumber,
} from "@medusajs/framework/utils"
import type { Logger } from "@medusajs/framework/types"
import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
  PaymentSessionStatus,
} from "@medusajs/framework/types"
import crypto from "crypto"

/**
 * `MEDUSA_EXTENSIONS.md` #4 — the local payment provider, approved as
 * Paystack 2026-07-19 (`docs/DECISION_LOG.md`). A real, standalone Payment
 * Provider module implementing Medusa's documented interface directly
 * against Paystack's Transaction API (https://paystack.com/docs/api/transaction/)
 * — no core changes, per `ARCHITECTURE.md`.
 *
 * **Redirect-based flow, not an inline/client-confirmed one**: Paystack's
 * standard integration is a hosted checkout page, not a client-side SDK
 * confirmation step the way Stripe's is. `initiatePayment` creates a
 * Paystack transaction and returns its `authorization_url` in `data` (the
 * one field the abstract class's own docs confirm is storefront-visible);
 * the storefront redirects the customer there. Paystack redirects back to
 * a callback URL with the transaction reference; the storefront then
 * completes the cart as normal, which calls `authorizePayment` — this
 * provider verifies the transaction with Paystack at that point rather
 * than trusting the redirect alone. `getWebhookActionAndData` (Paystack's
 * `charge.success` webhook) is the resilient, redirect-independent
 * confirmation path and should be configured as the primary source of
 * truth in Paystack's dashboard once a public backend URL exists.
 *
 * Paystack's API takes/returns amounts in the currency's smallest unit
 * (kobo for NGN — ×100 of the naira amount); every other Medusa-facing
 * amount in this project (including this provider's own inputs/outputs)
 * is the plain decimal amount, matching this project's own established
 * money convention (confirmed directly against real seeded prices in
 * Milestones 15/16 — `"amount": 4500` reads as ₦4,500.00, not ₦45.00).
 */

type Options = {
  secretKey: string
}

type PaystackTransactionData = {
  reference: string
  authorization_url?: string
  access_code?: string
  status?: string
  amount?: number
  currency?: string
  gateway_response?: string
}

const PAYSTACK_BASE_URL = "https://api.paystack.co"

class PaystackPaymentProviderService extends AbstractPaymentProvider<Options> {
  static identifier = "paystack"

  protected logger_: Logger
  protected options_: Options

  static validateOptions(options: Record<string, unknown>) {
    if (!options.secretKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Paystack's secret key is required in the provider's options (PAYSTACK_SECRET_KEY)."
      )
    }
  }

  constructor(cradle: { logger: Logger }, options: Options) {
    super(cradle, options)
    this.logger_ = cradle.logger
    this.options_ = options
  }

  private async paystackFetch<T = Record<string, unknown>>(
    path: string,
    init?: RequestInit
  ): Promise<{ status: boolean; message: string; data: T }> {
    const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.options_.secretKey}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    })

    const body = await response.json()

    if (!response.ok || body.status === false) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Paystack request to ${path} failed: ${body.message ?? response.statusText}`
      )
    }

    return body
  }

  private toKobo(amount: number | string): number {
    return Math.round(Number(amount) * 100)
  }

  private toNaira(koboAmount: number): number {
    return koboAmount / 100
  }

  private mapStatus(paystackStatus: string | undefined): PaymentSessionStatus {
    switch (paystackStatus) {
      case "success":
        return "captured"
      case "abandoned":
      case "failed":
        return "error"
      case "pending":
      case "ongoing":
      case "processing":
      case "queued":
        return "pending"
      default:
        return "pending"
    }
  }

  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const email =
      (input.context?.customer as { email?: string } | undefined)?.email ??
      "guest@liquorcentral.ng"

    const result = await this.paystackFetch<PaystackTransactionData>(
      "/transaction/initialize",
      {
        method: "POST",
        body: JSON.stringify({
          email,
          amount: this.toKobo(input.amount as number),
          currency: input.currency_code.toUpperCase(),
        }),
      }
    )

    return {
      id: result.data.reference,
      data: { ...result.data },
      status: "pending_authorization",
    }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    // Paystack transactions are amount-locked once created — a genuine
    // amount/currency change re-initiates a fresh transaction rather than
    // mutating the existing one, which Paystack's API has no mechanism for.
    const email =
      (input.context?.customer as { email?: string } | undefined)?.email ??
      "guest@liquorcentral.ng"

    const result = await this.paystackFetch<PaystackTransactionData>(
      "/transaction/initialize",
      {
        method: "POST",
        body: JSON.stringify({
          email,
          amount: this.toKobo(input.amount as number),
          currency: input.currency_code.toUpperCase(),
        }),
      }
    )

    return { data: { ...result.data } }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    // Paystack has no "cancel an unpaid transaction" endpoint — an
    // abandoned transaction simply expires on Paystack's side. Nothing
    // remote to call; pass the existing data through unchanged.
    return { data: input.data }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return { data: input.data }
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    const reference = input.data?.reference as string | undefined
    if (!reference) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Missing Paystack transaction reference on payment session data."
      )
    }

    const result = await this.paystackFetch<PaystackTransactionData>(
      `/transaction/verify/${encodeURIComponent(reference)}`
    )

    const status = this.mapStatus(result.data.status)

    return {
      data: { ...input.data, ...result.data },
      status,
    }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    // Paystack captures a card charge at the moment of successful payment
    // — there is no separate manual-capture step to call for the standard
    // Transaction API. This mirrors "authorized === captured" for this
    // provider, consistent with `07_CHECKOUT_SPECIFICATION.md`'s Payment
    // State Behaviour treating an instantly-captured PSP honestly rather
    // than inventing a capture step Paystack doesn't have.
    return { data: input.data }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const reference = input.data?.reference as string | undefined
    if (!reference) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Missing Paystack transaction reference on payment data."
      )
    }

    const result = await this.paystackFetch("/refund", {
      method: "POST",
      body: JSON.stringify({
        transaction: reference,
        amount: this.toKobo(input.amount as number),
      }),
    })

    return { data: { ...input.data, last_refund: result.data } }
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    const reference = input.data?.reference as string | undefined
    if (!reference) {
      return { data: input.data }
    }

    const result = await this.paystackFetch<PaystackTransactionData>(
      `/transaction/verify/${encodeURIComponent(reference)}`
    )

    return { data: { ...result.data } }
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const reference = input.data?.reference as string | undefined
    if (!reference) {
      return { status: "pending" }
    }

    const result = await this.paystackFetch<PaystackTransactionData>(
      `/transaction/verify/${encodeURIComponent(reference)}`
    )

    return {
      status: this.mapStatus(result.data.status),
      data: { ...result.data },
    }
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    const signature = payload.headers["x-paystack-signature"] as
      | string
      | undefined
    const rawBody =
      typeof payload.rawData === "string"
        ? payload.rawData
        : payload.rawData.toString("utf8")

    const expectedSignature = crypto
      .createHmac("sha512", this.options_.secretKey)
      .update(rawBody)
      .digest("hex")

    if (!signature || signature !== expectedSignature) {
      this.logger_.warn("Paystack webhook signature verification failed")
      return { action: "not_supported" }
    }

    const event = payload.data.event as string | undefined
    const data = payload.data.data as PaystackTransactionData | undefined

    if (!data?.reference) {
      return { action: "not_supported" }
    }

    switch (event) {
      case "charge.success":
        return {
          action: "authorized",
          data: {
            session_id: data.reference,
            amount: new BigNumber(this.toNaira(data.amount ?? 0)),
          },
        }
      default:
        return { action: "not_supported" }
    }
  }
}

export default PaystackPaymentProviderService
