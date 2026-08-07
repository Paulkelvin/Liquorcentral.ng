import { listCategories } from "@lib/data/categories"
import RefinementList from "./index"

/**
 * Splits the categories fetch off from the page it sits beside.
 *
 * All three callers (store, category, collection templates) used to
 * `await listCategories(...)` directly in the template body, before
 * returning any JSX — which meant a slow categories request held up
 * the page's title, sort control and product grid too, even though the
 * grid already streams in through its own independent `<Suspense>`.
 * "Categories doesn't come to the page fast sometimes" was that fetch
 * blocking everything else waiting on it, not the grid itself being
 * slow.
 *
 * Wrapping this in its own `<Suspense>` (each caller does, around this
 * component) lets the rest of the page render immediately regardless
 * of how long the category list takes — only the sidebar itself shows
 * a skeleton in the meantime.
 */
export default async function CategoriesSidebar({
  hideOptionsPicker = false,
}: {
  hideOptionsPicker?: boolean
}) {
  const categories = await listCategories({
    fields: "handle,name,parent_category_id",
    limit: 100,
  })
    .then((cats) => cats.filter((c) => !c.parent_category_id))
    .catch(() => [])

  return (
    <RefinementList
      hideOptionsPicker={hideOptionsPicker}
      categories={categories}
    />
  )
}
