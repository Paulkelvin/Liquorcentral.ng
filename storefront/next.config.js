const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * Medusa Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME

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
  // Baseline response headers. No CSP yet — a real Content-Security-Policy
  // needs an audited allowlist of every script/style/image/connect source
  // this app actually uses (Medusa backend, Sanity CDN, S3, Paystack once
  // active) or it silently breaks the app instead of protecting it; these
  // four are safe defaults that need no such inventory.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
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
