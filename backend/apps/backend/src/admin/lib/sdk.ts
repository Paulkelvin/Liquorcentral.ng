import Medusa from "@medusajs/js-sdk"

/**
 * Shared Admin JS SDK client for all admin dashboard extensions (widgets,
 * routes). One instance, reused — not per-widget.
 */
export const sdk = new Medusa({
  baseUrl: import.meta.env.VITE_BACKEND_URL || "/",
  debug: import.meta.env.DEV,
  auth: {
    type: "session",
  },
})
