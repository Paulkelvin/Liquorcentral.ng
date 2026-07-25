import { clx } from "@modules/common/components/ui"

const Divider = ({ className }: { className?: string }) => (
  <div
    // A rule needs room on both sides or it reads as underlining the
    // text above it rather than separating two regions. `mt-1` gave it
    // none. Callers can still override with their own margin.
    className={clx("h-px w-full border-b border-divider my-4", className)}
  />
)

export default Divider
