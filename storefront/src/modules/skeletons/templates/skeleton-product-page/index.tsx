import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"

/**
 * The product page had no `loading.tsx` at all — Paul's report of
 * "loading" hanging on individual products was this: without one, the
 * App Router shows nothing during navigation (the previous page just sits
 * frozen) until the whole page, backend fetch included, resolves. This
 * mirrors `templates/index.tsx`'s own layout (image tile left, info
 * column right, same breakpoint) closely enough that the swap from
 * skeleton to real content doesn't jump.
 */
export default function SkeletonProductPage() {
  return (
    <div className="animate-pulse">
      <div className="ds-container pt-6">
        <div className="flex items-center gap-x-2">
          <div className="h-4 w-10 bg-ink-100" />
          <div className="h-4 w-4 bg-ink-100" />
          <div className="h-4 w-24 bg-ink-100" />
        </div>
      </div>
      <div className="ds-container grid grid-cols-1 gap-x-12 py-6 small:grid-cols-2">
        <div className="aspect-[29/34] w-full bg-ink-100" />
        <div className="flex flex-col gap-y-8 py-8">
          <div className="flex flex-col gap-y-4">
            <div className="h-4 w-28 bg-ink-100" />
            <div className="h-8 w-3/4 bg-ink-100" />
            <div className="h-4 w-full bg-ink-100" />
            <div className="h-4 w-2/3 bg-ink-100" />
          </div>
          <div className="h-7 w-32 bg-ink-100" />
          <div className="h-11 w-40 bg-ink-100" />
          <div className="h-11 w-full bg-ink-100" />
        </div>
      </div>
      <div className="ds-container my-16 small:my-32">
        <SkeletonRelatedProducts />
      </div>
    </div>
  )
}
