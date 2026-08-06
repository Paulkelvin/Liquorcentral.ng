import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px]">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-medium text-text-muted hover:text-text-secondary"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        {/* The product title is this page's single most important heading
            — a genuine axe-core "page-has-heading-one" finding confirmed
            no PDP had an <h1> at all (05_PRODUCT_DETAILS_SPECIFICATION.md
            §25).

            **22px on mobile, up to 32px from `small:`** — the fixed
            `text-3xl` this used to render at everywhere read oversized on
            a phone (Paul's own note, checked against "Jollof Rice with
            Grilled Chicken" wrapping to two heavy lines above the fold).
            Every other page-level heading in this app already scales this
            way — the category and Food Central page titles, Featured
            Collection's own heading — this was the one left on a single
            fixed size. */}
        <Heading
          level="h1"
          className="!text-[22px] font-semibold leading-tight text-text-primary small:!text-[32px] small:leading-10"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        <Text
          className="text-medium text-text-secondary whitespace-pre-line"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      </div>
    </div>
  )
}

export default ProductInfo
