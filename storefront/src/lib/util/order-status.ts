/**
 * 08_CUSTOMER_ACCOUNT_SPECIFICATION.md §13 — "order status reflects real
 * fulfillment state... the exact status vocabulary... is an operational
 * detail this document does not invent." Reuses Medusa's own native
 * `fulfillment_status`/`payment_status` values verbatim (no custom
 * taxonomy invented), just formatted for display.
 */
export function formatOrderStatus(status: string): string {
  const formatted = status.split("_").join(" ")
  return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
}
