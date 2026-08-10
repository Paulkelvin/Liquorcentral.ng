import { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

const STOREFRONT_URL =
  process.env.STOREFRONT_URL ||
  "https://liquorcentralng-production.up.railway.app"

function fixUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith("/brand/")) return STOREFRONT_URL + url
  if (url.includes("localhost")) return null
  if (url.includes("wikimedia")) return null
  return url
}

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

      const fixedThumb = fixUrl(thumb)
      const fixedImages = images.map((img: any) => ({
        url: fixUrl(img.url) || img.url,
      }))

      const thumbChanged = fixedThumb !== thumb
      const imagesChanged = fixedImages.some(
        (img: any, i: number) => img.url !== images[i]?.url
      )

      if (!thumbChanged && !imagesChanged) continue

      const update: any = {}
      if (thumbChanged && fixedThumb) {
        update.thumbnail = fixedThumb
      } else if (thumbChanged && !fixedThumb) {
        const firstGood = fixedImages.find(
          (img: any) =>
            img.url &&
            !img.url.includes("wikimedia") &&
            !img.url.includes("localhost")
        )
        if (firstGood) update.thumbnail = firstGood.url
      }
      if (imagesChanged) {
        update.images = fixedImages
      }

      if (Object.keys(update).length) {
        await productService.updateProducts(product.id, update)
        fixedCount++
      }
    }

    if (fixedCount > 0) {
      logger.info(`[fix-product-images] Fixed ${fixedCount} products with broken image URLs`)
    }
  } catch (err: any) {
    logger.warn(`[fix-product-images] ${err.message}`)
  }
}
