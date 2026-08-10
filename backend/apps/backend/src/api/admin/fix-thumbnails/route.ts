import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

const STOREFRONT_URL =
  process.env.STOREFRONT_URL ||
  "https://liquorcentralng-production.up.railway.app"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const productService = req.scope.resolve(Modules.PRODUCT)

  const [products] = await productService.listAndCountProducts(
    {},
    { select: ["id", "title", "thumbnail", "images.*"], take: 500 }
  )

  const fixed: string[] = []

  for (const product of products) {
    const thumb = product.thumbnail as string | null
    const images = (product as any).images || []
    const update: any = {}

    if (thumb?.startsWith("/brand/")) {
      update.thumbnail = STOREFRONT_URL + thumb
    }

    const newImages: { url: string }[] = []
    let imagesChanged = false
    for (const img of images) {
      if (img.url?.startsWith("/brand/")) {
        newImages.push({ url: STOREFRONT_URL + img.url })
        imagesChanged = true
      } else {
        newImages.push({ url: img.url })
      }
    }
    if (imagesChanged) update.images = newImages

    if (Object.keys(update).length) {
      await productService.updateProducts(product.id, update)
      fixed.push(`${product.title}: ${update.thumbnail || "images only"}`)
    }
  }

  res.json({
    message: `Fixed ${fixed.length} products`,
    fixed,
    total_products: products.length,
  })
}
