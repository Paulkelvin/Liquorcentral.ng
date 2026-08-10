import { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { v2 as cloudinary } from "cloudinary"

const STOREFRONT_URL =
  process.env.STOREFRONT_URL ||
  "https://liquorcentralng-production.up.railway.app"

const BRAND = (file: string) => `/brand/products/${file}`

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

async function uploadToCloudinary(
  imageUrl: string,
  folder: string
): Promise<string> {
  const result = await cloudinary.uploader.upload(imageUrl, {
    folder,
    resource_type: "image",
    overwrite: false,
    unique_filename: true,
  })
  return result.secure_url
}

export default async function fixProductImages(
  container: MedusaContainer
) {
  const logger = container.resolve("logger")
  const productService = container.resolve(Modules.PRODUCT)

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  if (!cloudName) {
    logger.warn("[fix-product-images] CLOUDINARY_CLOUD_NAME not set, skipping")
    return
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })

  const folder = process.env.CLOUDINARY_FOLDER || "liquorcentral"

  try {
    const [products] = await productService.listAndCountProducts(
      {},
      { select: ["id", "title", "thumbnail", "images.*"], take: 500 }
    )

    let fixedCount = 0
    const uploadCache = new Map<string, string>()

    for (const product of products) {
      const thumb = product.thumbnail as string | null
      const title = product.title as string
      const images = (product as any).images || []

      let sourcePath: string | null = null

      if (thumb?.startsWith("/brand/")) {
        sourcePath = thumb
      } else if (
        thumb &&
        (thumb.includes("wikimedia") || thumb.includes("localhost"))
      ) {
        sourcePath = WIKIPEDIA_REPLACEMENTS[title] || null
      } else if (!thumb) {
        sourcePath = WIKIPEDIA_REPLACEMENTS[title] || null
      } else if (thumb.includes("res.cloudinary.com")) {
        continue
      } else {
        continue
      }

      if (!sourcePath) continue

      try {
        let cloudinaryUrl: string

        if (uploadCache.has(sourcePath)) {
          cloudinaryUrl = uploadCache.get(sourcePath)!
        } else {
          const fullUrl = STOREFRONT_URL + sourcePath
          cloudinaryUrl = await uploadToCloudinary(fullUrl, folder)
          uploadCache.set(sourcePath, cloudinaryUrl)
          logger.info(`[fix-product-images] Uploaded ${sourcePath} -> ${cloudinaryUrl}`)
        }

        await productService.updateProducts(product.id, {
          thumbnail: cloudinaryUrl,
          images: [{ url: cloudinaryUrl }],
        })
        fixedCount++
        logger.info(`[fix-product-images] Updated ${title}`)
      } catch (err: any) {
        logger.warn(`[fix-product-images] Failed for ${title}: ${err.message}`)
      }
    }

    if (fixedCount > 0) {
      logger.info(`[fix-product-images] Fixed ${fixedCount} products total`)
    } else {
      logger.info("[fix-product-images] All product images already on Cloudinary")
    }
  } catch (err: any) {
    logger.warn(`[fix-product-images] ${err.message}`)
  }
}
