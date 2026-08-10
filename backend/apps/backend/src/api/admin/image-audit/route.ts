import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const productService = req.scope.resolve(Modules.PRODUCT)

  const [products] = await productService.listAndCountProducts(
    {},
    { select: ["id", "title", "thumbnail", "images.*"], take: 500 }
  )

  const audit = products.map((p: any) => ({
    id: p.id,
    title: p.title,
    thumbnail: p.thumbnail,
    thumbnail_status: !p.thumbnail
      ? "MISSING"
      : p.thumbnail.includes("localhost")
        ? "BROKEN_LOCALHOST"
        : p.thumbnail.startsWith("http://")
          ? "INSECURE_HTTP"
          : "OK",
    images: (p.images || []).map((img: any) => ({
      url: img.url,
      status: !img.url
        ? "MISSING"
        : img.url.includes("localhost")
          ? "BROKEN_LOCALHOST"
          : img.url.startsWith("http://")
            ? "INSECURE_HTTP"
            : "OK",
    })),
  }))

  const broken = audit.filter(
    (p: any) =>
      p.thumbnail_status !== "OK" ||
      p.images.some((img: any) => img.status !== "OK")
  )

  res.json({
    total_products: products.length,
    broken_count: broken.length,
    broken,
    all: audit,
  })
}
