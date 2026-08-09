import { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"
import { listRegions } from "@lib/data/regions"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"

const STATIC_ROUTES = [
  { path: "", priority: 1, changeFrequency: "daily" as const },
  { path: "/store", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/food-central", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/blog", priority: 0.5, changeFrequency: "weekly" as const },
  { path: "/legal", priority: 0.3, changeFrequency: "yearly" as const },
]

/**
 * No sitemap existed anywhere — Google was left to discover the catalog
 * by crawling links alone. Built against the live store rather than a
 * hardcoded route list so it never drifts from the real catalog; if the
 * backend is unreachable at generation time this still returns the
 * static routes rather than failing the whole page, since a partial
 * sitemap beats a 500.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseURL()

  let countryCode = process.env.NEXT_PUBLIC_DEFAULT_REGION || "ng"
  try {
    const regions = await listRegions()
    const firstCountry = regions?.[0]?.countries?.[0]?.iso_2
    if (firstCountry) {
      countryCode = firstCountry
    }
  } catch {
    // Keep the env-configured default.
  }

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${baseUrl}/${countryCode}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  try {
    const categories = await listCategories()
    for (const category of categories ?? []) {
      if (!category.handle) continue
      entries.push({
        url: `${baseUrl}/${countryCode}/categories/${category.handle}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      })
    }
  } catch {
    // Categories omitted rather than failing the sitemap.
  }

  try {
    const { collections } = await listCollections({ fields: "handle" })
    for (const collection of collections ?? []) {
      if (!collection.handle) continue
      entries.push({
        url: `${baseUrl}/${countryCode}/collections/${collection.handle}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      })
    }
  } catch {
    // Collections omitted rather than failing the sitemap.
  }

  return entries
}
