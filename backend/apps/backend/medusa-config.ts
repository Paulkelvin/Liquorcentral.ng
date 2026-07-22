import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// TEMPORARY diagnostic — remove once the Railway deployment env-var
// mismatch is root-caused. Prints only presence/length, never secret
// values, to the deploy log.
console.log("[env-diagnostic]", {
  cwd: process.cwd(),
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET_present: !!process.env.JWT_SECRET,
  JWT_SECRET_length: process.env.JWT_SECRET?.length ?? 0,
  COOKIE_SECRET_present: !!process.env.COOKIE_SECRET,
  REDIS_URL_present: !!process.env.REDIS_URL,
  DATABASE_URL_present: !!process.env.DATABASE_URL,
  STORE_CORS_present: !!process.env.STORE_CORS,
  totalEnvVarCount: Object.keys(process.env).length,
})

/**
 * `MEDUSA_EXTENSIONS.md` #4/#5 — Paystack (payment) and the email/WhatsApp
 * notification channels are all approved decisions, but real credentials
 * for none of them exist in this environment yet. Each provider below is
 * registered only when its own required env var(s) are actually present,
 * so this config boots identically to before (system-default payment
 * only, no notification providers beyond the native log-only default)
 * until real keys are supplied — adding them and restarting is the only
 * step needed to activate each provider; no code change required.
 */
type ModuleProviderEntry = {
  resolve: string
  id: string
  options: Record<string, unknown>
}

const paymentProviders: ModuleProviderEntry[] = []
if (process.env.PAYSTACK_SECRET_KEY) {
  paymentProviders.push({
    resolve: "./src/modules/payment-paystack",
    id: "paystack",
    options: {
      secretKey: process.env.PAYSTACK_SECRET_KEY,
    },
  })
}

const notificationProviders: ModuleProviderEntry[] = []
if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM) {
  notificationProviders.push({
    resolve: "@medusajs/notification-sendgrid",
    id: "sendgrid",
    options: {
      channels: ["email"],
      api_key: process.env.SENDGRID_API_KEY,
      from: process.env.SENDGRID_FROM,
    },
  })
}
if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
  notificationProviders.push({
    resolve: "./src/modules/notification-whatsapp",
    id: "whatsapp",
    options: {
      channels: ["whatsapp"],
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      languageCode: process.env.WHATSAPP_LANGUAGE_CODE,
    },
  })
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  // Production-mode infrastructure from day one — this project never runs
  // on Medusa's in-memory dev defaults (docs/ROADMAP.md Phase 1).
  modules: [
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.EVENTS_REDIS_URL,
      },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: {
        redis: {
          redisUrl: process.env.WE_REDIS_URL,
        },
      },
    },
    {
      resolve: "@medusajs/medusa/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/locking-redis",
            id: "locking-redis",
            is_default: true,
            options: {
              redisUrl: process.env.LOCKING_REDIS_URL,
            },
          },
        ],
      },
    },
    {
      // @medusajs/medusa/cache-redis is deprecated as of Medusa v2.11 in
      // favor of the new Caching Module, which is still feature-flagged
      // (MEDUSA_FF_CACHING) as of v2.17.2. Using the deprecated-but-still
      // supported Redis cache module until the replacement is stable,
      // rather than adopting an experimental flag for infra bootstrap.
      resolve: "@medusajs/medusa/cache-redis",
      options: {
        redisUrl: process.env.CACHE_REDIS_URL,
      },
    },
    // Custom modules (MEDUSA_EXTENSIONS.md) — each a small module linked
    // 1:1 to Product via defineLink, never a core change (ARCHITECTURE.md).
    {
      resolve: "./src/modules/wine-details",
    },
    {
      resolve: "./src/modules/food-details",
    },
    // Delivery-slot scheduling module (TIER_B_DELIVERY_SLOT_MODULE.md) —
    // linked to Fulfillment's Shipping Option via defineLink, not 1:1
    // (many slots per shipping option); Food Central only, no application
    // to Wine & Spirits (§8).
    {
      resolve: "./src/modules/delivery-slot",
    },
    // Paystack (`MEDUSA_EXTENSIONS.md` #4, approved) — conditionally
    // registered only once PAYSTACK_SECRET_KEY exists; see the comment
    // above. pp_system_default remains registered natively regardless.
    ...(paymentProviders.length
      ? [
          {
            resolve: "@medusajs/medusa/payment",
            options: { providers: paymentProviders },
          },
        ]
      : []),
    // Email (SendGrid) and WhatsApp (Meta Cloud API) notification
    // channels (`MEDUSA_EXTENSIONS.md` #5, approved) — each conditionally
    // registered only once its own required env vars exist; see the
    // comment above.
    ...(notificationProviders.length
      ? [
          {
            resolve: "@medusajs/medusa/notification",
            options: { providers: notificationProviders },
          },
        ]
      : []),
  ],
})
