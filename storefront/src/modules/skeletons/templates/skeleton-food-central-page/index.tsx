import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

/** Mirrors `food-central/components/menu-grid`'s own layout — no sidebar,
 *  unlike the Wine & Spirits listings. */
export default function SkeletonFoodCentralPage() {
  return (
    <div className="ds-container animate-pulse py-6 small:py-10">
      <div className="mb-3 flex flex-col gap-y-2">
        <div className="h-7 w-48 bg-ink-100" />
        <div className="h-4 w-72 bg-ink-100" />
      </div>
      <SkeletonProductGrid />
    </div>
  )
}
