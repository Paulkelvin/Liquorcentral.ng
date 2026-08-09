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

      /**
       * INCR and PEXPIRE in one atomic step, rather than two awaited
       * round trips.
       *
       * As two calls there is a window between them — a process restart,
       * a Redis failover, or a rejected second command — where the
       * counter exists with **no TTL at all**. Redis keeps such a key
       * forever, so the very first request from an IP could leave a
       * counter that never resets and never decays: that IP is then
       * permanently locked out of logging in and out of placing orders,
       * with no self-recovery. Rare, but the failure is silent,
       * indefinite, and lands on exactly the routes a customer cannot
       * route around.
       *
       * The `PTTL == -1` branch also repairs any key already stuck in
       * that state from an earlier deploy, so this heals existing
       * damage rather than only preventing new damage.
       */
      const [count, ttl] = (await redis.eval(
        `local c = redis.call('INCR', KEYS[1])
         local t = redis.call('PTTL', KEYS[1])
         if c == 1 or t < 0 then
           redis.call('PEXPIRE', KEYS[1], ARGV[1])
           t = tonumber(ARGV[1])
         end
         return {c, t}`,
        1,
        key,
        String(windowMs)
      )) as [number, number]

      if (count > max) {
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
