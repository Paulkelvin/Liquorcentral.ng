import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const productService = req.scope.resolve(Modules.PRODUCT)

  const [products] = await productService.listAndCountProducts(
    {},
    { select: ["id", "title", "thumbnail", "images.*"], take: 500 }
  )

  const fixed: string[] = []

  for (const product of products) {
    const thumb = product.thumbnail
    const isBroken =
      !thumb ||
      thumb.includes("localhost") ||
      thumb.startsWith("http://")

    if (isBroken && product.images?.length) {
      const firstWorkingImage = product.images.find(
        (img: any) =>
          img.url &&
          !img.url.includes("localhost") &&
          img.url.startsWith("https://")
      )

      if (firstWorkingImage) {
        await productService.updateProducts(product.id, {
          thumbnail: firstWorkingImage.url,
        })
        fixed.push(`${product.title}: ${firstWorkingImage.url}`)
      }
    }
  }

  res.json({
    message: `Fixed ${fixed.length} product thumbnails`,
    fixed,
    total_products: products.length,
  })
}
