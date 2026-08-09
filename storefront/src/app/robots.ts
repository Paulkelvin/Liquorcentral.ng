import { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"

/**
 * No robots.txt existed anywhere in the app — search engines were
 * crawling with no guidance at all. Account and checkout are disallowed
 * since neither is ever a useful landing page from search and both sit
 * behind or lead into personal data.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseURL()

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/checkout", "/*/account", "/*/checkout"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
