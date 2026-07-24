import { Container } from "@modules/common/components/ui"

const SkeletonProductPreview = () => {
  return (
    <div className="animate-pulse">
      <Container elevated={false} className="aspect-[9/16] w-full !p-0 bg-ink-100" />
      <div className="flex justify-between text-body mt-2">
        <div className="w-2/5 h-6 bg-ink-100"></div>
        <div className="w-1/5 h-6 bg-ink-100"></div>
      </div>
    </div>
  )
}

export default SkeletonProductPreview
