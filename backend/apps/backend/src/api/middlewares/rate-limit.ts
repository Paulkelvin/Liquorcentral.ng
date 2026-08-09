import {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import Redis from "ioredis"

/**
 * A fixed-window per-IP limiter for the handful of routes that are
 * actually worth protecting: credential attacks (login, register,
 * password reset) and order-placement abuse (card testing, order spam).
 * Deliberately not applied to `/store/carts/:id` — that's the same
 * generic cart-update endpoint the optimistic quantity stepper hits on
 * every "+"/"-" tap (see cart-context.tsx on the storefront), so rate
 * limiting it would throttle normal shopping, not abuse. Promo-code
 * brute forcing goes through that same endpoint and isn't separately
 * limited here as a result — a real fix needs Medusa to expose promo
 * application as its own route, which it doesn't today.
 *
 * Backed by Redis (the same instance every other module in this app
 * already uses — see REDIS_URL) rather than in-memory, so the count is
 * correct across every backend instance once this runs behind more than
 * one process, not just the one that happened to receive the request.
 * A single shared connection, opened once per process.
 */
const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
})
redis.on("error", (err) => {
  console.warn("[rate-limit] Redis connection error:", err.message)
})

function clientIp(req: MedusaRequest): string {
  const forwarded = req.headers["x-forwarded-for"]
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim()
  }
  return req.ip || req.socket.remoteAddress || "unknown"
}

type RateLimitOptions = {
  /** Identifies this route in the Redis key — keeps limits independent per route. */
  name: string
  windowMs: number
  max: number
}

/**
 * Fails open: if Redis is unreachable, the request proceeds rather than
 * every login/checkout attempt breaking because the rate limiter's own
 * dependency is down. The whole point is to blunt abuse, not to become a
 * new single point of failure for real customers.
 */
export function rateLimit({ name, windowMs, max }: RateLimitOptions) {
  return async (
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ) => {
    try {
      const key = `ratelimit:${name}:${clientIp(req)}`
      const count = await redis.incr(key)
      if (count === 1) {
        await redis.pexpire(key, windowMs)
      }

      if (count > max) {
        const ttl = await redis.pttl(key)
        res.setHeader("Retry-After", Math.ceil(Math.max(ttl, 0) / 1000))
        res.status(429).json({
          message: "Too many requests. Please try again shortly.",
        })
        return
      }

      next()
    } catch (err) {
      console.warn("[rate-limit] skipped due to error:", (err as Error).message)
      next()
    }
  }
}
