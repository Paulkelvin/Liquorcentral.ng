/**
 * Date and reading time, in the one format the journal uses everywhere.
 *
 * The `<time>` element carries the machine-readable value; the visible
 * string is formatted for a Nigerian reader (day before month) and
 * pinned to `en-NG` so the server and the browser cannot disagree and
 * trigger a hydration mismatch.
 */
export default function PostMeta({
  publishedAt,
  readingTime,
  className,
}: {
  publishedAt: string
  readingTime?: number
  className?: string
}) {
  const date = new Date(publishedAt)
  const formatted = new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)

  return (
    <p className={className ?? "text-caption text-text-muted"}>
      <time dateTime={publishedAt}>{formatted}</time>
      {readingTime ? (
        <>
          <span aria-hidden="true"> · </span>
          <span>{readingTime} min read</span>
        </>
      ) : null}
    </p>
  )
}
