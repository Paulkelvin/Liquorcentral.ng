import { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

const STOREFRONT_URL =
  process.env.STOREFRONT_URL ||
  "https://liquorcentralng-production.up.railway.app"

const BRAND = (file: string) => `${STOREFRONT_URL}/brand/products/${file}`

const WIKIPEDIA_REPLACEMENTS: Record<string, string> = {
  "Château Margaux 2015": BRAND("wine-red-bordeaux.webp"),
  "Casillero del Diablo Cabernet Sauvignon": BRAND("wine-red-bordeaux.webp"),
  "Dom Pérignon Vintage 2013": BRAND("sparkling-prosecco.webp"),
  "Veuve Clicquot Yellow Label": BRAND("sparkling-prosecco.webp"),
  "Johnnie Walker Blue Label": BRAND("whisky-single-malt.webp"),
  "The Macallan 12 Year Double Cask": BRAND("whisky-single-malt.webp"),
  "Jack Daniel's Old No. 7": BRAND("whisky-single-malt.webp"),
  "Hennessy VSOP": BRAND("cognac-xo.webp"),
  "Bombay Sapphire Gin": BRAND("gin-botanical.webp"),
  "Bacardi Superior Rum": BRAND("rum-dark.webp"),
  "Patrón Silver Tequila": BRAND("tequila-blanco.webp"),
  "Absolut Vodka": BRAND("vodka-clear.webp"),
  "Tanqueray London Dry Gin": BRAND("gin-london-dry.webp"),
  "Captain Morgan Original Spiced Rum": BRAND("rum-spiced.webp"),
  "Chivas Regal 12 Year Old": BRAND("whisky-single-malt.webp"),
  "Courvoisier VS Cognac": BRAND("cognac-xo.webp"),
  "Don Julio Blanco Tequila": BRAND("tequila-blanco.webp"),
  "Jacob's Creek Shiraz Cabernet": BRAND("wine-red-bordeaux.webp"),
  "Pink Moscato": BRAND("wine-rose.webp"),
  "Glenfiddich 12 Year Old": BRAND("whisky-single-malt.webp"),
  "Premium Whisky Gift Set": BRAND("whisky-gift-tube.webp"),
  "Sommelier Corkscrew & Bottle Opener Set": BRAND("whisky-gift-tube.webp"),
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
      const title = product.title as string
      const images = (product as any).images || []
      const update: any = {}

      if (thumb?.startsWith("/brand/")) {
        update.thumbnail = STOREFRONT_URL + thumb
      } else if (
        thumb &&
        (thumb.includes("wikimedia") || thumb.includes("localhost"))
      ) {
        const replacement = WIKIPEDIA_REPLACEMENTS[title]
        if (replacement) {
          update.thumbnail = replacement
        }
      } else if (!thumb) {
        const replacement = WIKIPEDIA_REPLACEMENTS[title]
        if (replacement) {
          update.thumbnail = replacement
        }
      }

      const newImages: { url: string }[] = []
      let imagesChanged = false
      for (const img of images) {
        const url = img.url as string
        if (url?.startsWith("/brand/")) {
          newImages.push({ url: STOREFRONT_URL + url })
          imagesChanged = true
        } else if (
          url &&
          (url.includes("wikimedia") || url.includes("localhost"))
        ) {
          const replacement = WIKIPEDIA_REPLACEMENTS[title]
          if (replacement) {
            newImages.push({ url: replacement })
            imagesChanged = true
          } else {
            newImages.push({ url })
          }
        } else {
          newImages.push({ url })
        }
      }

      if (imagesChanged) update.images = newImages

      if (Object.keys(update).length) {
        await productService.updateProducts(product.id, update)
        fixedCount++
        logger.info(`[fix-product-images] ${title} -> ${update.thumbnail || "images only"}`)
      }
    }

    if (fixedCount > 0) {
      logger.info(
        `[fix-product-images] Fixed ${fixedCount} products total`
      )
    } else {
      logger.info("[fix-product-images] All product images OK")
    }
  } catch (err: any) {
    logger.warn(`[fix-product-images] ${err.message}`)
  }
}
