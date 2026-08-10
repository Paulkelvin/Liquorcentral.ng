import { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

const STOREFRONT_URL =
  process.env.STOREFRONT_URL ||
  "https://liquorcentralng-production.up.railway.app"

export default async function fixProductImages(
  container: MedusaContainer
) {
  const logger = container.resolve("logger")
  const productService = container.resolve(Modules.PRODUCT)

  try {
    const [products] = await productService.listAndCountProducts(
      {},
      { select: ["id", "title", "thumbnail", "images.*"], take: 500 }
    )

    let fixedCount = 0

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
      if (imagesChanged) {
        update.images = newImages
      }

      if (Object.keys(update).length) {
        await productService.updateProducts(product.id, update)
        fixedCount++
      }
    }

    if (fixedCount > 0) {
      logger.info(
        `[fix-product-images] Fixed ${fixedCount} products with relative image URLs`
      )
    }
  } catch (err: any) {
    logger.warn(`[fix-product-images] ${err.message}`)
  }
}
