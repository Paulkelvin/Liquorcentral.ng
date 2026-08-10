import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

const STOREFRONT_URL = process.env.STOREFRONT_URL || "https://liquorcentralng-production.up.railway.app"

function fixUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith("/brand/")) return STOREFRONT_URL + url
  if (url.includes("localhost")) return null
  if (url.includes("wikimedia")) return null
  return url
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const productService = req.scope.resolve(Modules.PRODUCT)

  const [products] = await productService.listAndCountProducts(
    {},
    { select: ["id", "title", "thumbnail", "images.*"], take: 500 }
  )

  const fixed: string[] = []

  for (const product of products) {
    const thumb = product.thumbnail
    const images = product.images || []

    const fixedThumb = fixUrl(thumb)
    const fixedImages = images.map((img: any) => ({
      url: fixUrl(img.url) || img.url,
    }))

    const thumbChanged = fixedThumb !== thumb
    const imagesChanged = fixedImages.some(
      (img: any, i: number) => img.url !== images[i]?.url
    )

    if (thumbChanged || imagesChanged) {
      const update: any = {}
      if (thumbChanged && fixedThumb) {
        update.thumbnail = fixedThumb
      } else if (thumbChanged && !fixedThumb) {
        const firstGood = fixedImages.find((img: any) => img.url && !img.url.includes("wikimedia") && !img.url.includes("localhost"))
        if (firstGood) update.thumbnail = firstGood.url
      }
      if (imagesChanged) {
        update.images = fixedImages
      }

      if (Object.keys(update).length) {
        await productService.updateProducts(product.id, update)
        fixed.push(`${product.title}: thumb=${update.thumbnail || "unchanged"}`)
      }
    }
  }

  res.json({
    message: `Fixed ${fixed.length} products`,
    fixed,
    total_products: products.length,
  })
}
