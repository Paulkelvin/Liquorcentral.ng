import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    sessionOptions: {
      ttl: 7 * 24 * 60 * 60 * 1000,
    },
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
      jwtExpiresIn: "7d",
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
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "./src/providers/file-cloudinary",
            id: "cloudinary",
            is_default: true,
            options: {
              cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
              api_key: process.env.CLOUDINARY_API_KEY,
              api_secret: process.env.CLOUDINARY_API_SECRET,
              folder: process.env.CLOUDINARY_FOLDER ?? "liquorcentral",
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/providers/notification-resend",
            id: "resend",
            is_default: true,
            options: {
              api_key: process.env.RESEND_API_KEY,
              from: process.env.RESEND_FROM || "onboarding@resend.dev",
            },
          },
        ],
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
  ],
})
