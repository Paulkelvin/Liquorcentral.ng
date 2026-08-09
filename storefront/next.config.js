const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * Medusa Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME

/**
 * Content-Security-Policy, built from the sources this app actually
 * uses rather than copied from a template — a CSP listing hosts the app
 * doesn't talk to protects nothing, and one missing a host it does talk
 * to breaks the app in production only.
 *
 * The Medusa backend origin is derived from the same env var the client
 * SDK uses, because it differs per environment (localhost in dev, a real
 * host in production); hardcoding it here would silently break `connect-src`
 * on deploy. Payment-provider hosts are listed unconditionally: they cost
 * nothing while inactive and would otherwise be the first thing to break
 * the moment real Paystack/Stripe keys are supplied.
 *
 * **On `'unsafe-inline'` for scripts** — this is a deliberate, informed
 * trade-off, not an oversight. Removing it means nonce-based CSP, which in
 * the App Router requires generating a per-request nonce in middleware, and
 * that opts *every* page out of static rendering — including the 13
 * prerendered category pages this build currently emits. The CSP is
 * therefore strict on every directive where strictness is free
 * (`object-src`, `base-uri`, `frame-ancestors`, `form-action`, and a closed
 * allowlist for `connect-src`/`img-src`/`frame-src`), which still blocks
 * externally-hosted script injection, data exfiltration to arbitrary hosts,
 * clickjacking, and base-tag hijacking. What it does not block is injected
 * *inline* script — so this reduces attack surface, it does not make XSS
 * impossible, and output escaping remains the real defence.
 */
function contentSecurityPolicy() {
  const isDev = process.env.NODE_ENV !== "production"

  const backendOrigin = (() => {
    try {
      return new URL(
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      ).origin
    } catch {
      return "http://localhost:9000"
    }
  })()

  const directives = {
    "default-src": ["'self'"],
    // 'unsafe-eval' is dev-only — React Refresh/HMR needs it; it is never
    // emitted in a production build.
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      ...(isDev ? ["'unsafe-eval'"] : []),
      "https://js.stripe.com",
      "https://js.paystack.co",
    ],
    // Next injects its stylesheets as inline <style>, and seven components
    // set inline `style={{…}}` for values only known at runtime.
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      backendOrigin,
      // `images.remotePatterns` below carries `*.s3.*.amazonaws.com`, but
      // CSP only accepts a wildcard as the *leftmost* label — a mid-pattern
      // one is invalid and browsers drop the whole source silently, which
      // is how this shipped broken the first time (caught by watching for
      // console violations rather than by reading the header). One
      // leftmost wildcard covers both `bucket.s3.amazonaws.com` and the
      // regional `bucket.s3.eu-west-1.amazonaws.com` form.
      "https://*.amazonaws.com",
      "https://cdn.sanity.io",
      "https://upload.wikimedia.org",
      ...(S3_HOSTNAME ? [`https://${S3_HOSTNAME}`] : []),
    ],
    "font-src": ["'self'", "data:"],
    "connect-src": [
      "'self'",
      backendOrigin,
      "https://*.api.sanity.io",
      "https://*.apicdn.sanity.io",
      "https://api.stripe.com",
      "https://api.paystack.co",
      // HMR websocket, dev only.
      ...(isDev ? ["ws:", "wss:"] : []),
    ],
    // Payment providers render their card fields in an iframe.
    "frame-src": [
      "'self'",
      "https://js.stripe.com",
      "https://hooks.stripe.com",
      "https://checkout.paystack.com",
    ],
    // Nothing on this site is a plugin, and nothing should ever frame it.
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "frame-ancestors": ["'none'"],
    // Paystack's redirect flow posts back to its own domain.
    "form-action": ["'self'", "https://checkout.paystack.com"],
  }

  if (!isDev) {
    directives["upgrade-insecure-requests"] = []
  }

  return Object.entries(directives)
    .map(([key, values]) => (values.length ? `${key} ${values.join(" ")}` : key))
    .join("; ")
}

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  // The floating dev-tools bubble Next.js overlays in development. It
  // never ships in a production build, but it sat over the UI in every
  // local screenshot, so it is switched off here too.
  devIndicators: false,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Both gates were previously silenced. `tsc --noEmit` and `next lint`
  // both run clean against the current codebase (zero type errors, only
  // two pre-existing exhaustive-deps warnings), so nothing here was
  // actually hiding a backlog — but leaving broken code shippable by
  // default is its own risk, so the gates are back on.
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy() },
          // Kept alongside the CSP's `frame-ancestors`, which supersedes it
          // in every modern browser but is ignored by older ones.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ]
  },
  images: {
    // Previously unoptimized outright — assumed the seed catalog's
    // Wikimedia-hotlinked thumbnails would break under Next's optimizer.
    // That's not actually how remote optimization works: Next fetches,
    // resizes and reformats from any host listed below, it doesn't
    // require the image to live on our own storage. Allowlisting
    // upload.wikimedia.org (the seed script's real image source — see
    // product-catalog-seed-v4.ts) gets responsive srcset/AVIF-WebP for
    // the current catalog today, without waiting on a storage migration.
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      // Sanity's image CDN — cover images and in-article images for the
      // journal and the About page.
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      ...(S3_HOSTNAME && S3_PATHNAME
        ? [
            {
              protocol: "https",
              hostname: S3_HOSTNAME,
              pathname: S3_PATHNAME,
            },
          ]
        : []),
    ],
  },
}

module.exports = nextConfig
