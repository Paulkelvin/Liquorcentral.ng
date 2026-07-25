"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import * as Accordion from "@radix-ui/react-accordion"
import { ChevronDownMini } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import clsx from "clsx"

import { sdk } from "@lib/config"
import {
  OPTION_VALUE_QUERY_KEY,
  parseOptionValueIds,
} from "@lib/util/product-option-filters"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import OptionsPicker from "./options-picker"

type RefinementListProps = {
  search?: boolean
  hideOptionsPicker?: boolean
  hideCategories?: boolean
  "data-testid"?: string
}

/**
 * The listing sidebar: collapsible filter groups, nothing else. Sorting
 * used to live here as a bulleted radio list, but it is a single-choice
 * control that belongs beside the results it reorders — it now renders
 * as a <select> in each template's own header row instead.
 *
 * Only groups backed by a real filter appear. Price range and region are
 * deliberately absent: neither the storefront query layer nor the
 * product model supports filtering on either today, and a control that
 * looks like a filter but changes nothing is worse than no control at
 * all.
 */
const RefinementList = ({
  hideOptionsPicker = false,
  hideCategories = false,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<
    HttpTypes.StoreProductCategory[]
  >([])
  // Open by default where there is room beside the results, collapsed on
  // a phone where an expanded list would push the products themselves
  // below the fold.
  const [openGroups, setOpenGroups] = useState<string[]>([])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setOpenGroups(["category"])
    }
  }, [])

  useEffect(() => {
    if (hideCategories) {
      return
    }
    let active = true
    sdk.client
      .fetch<{ product_categories?: HttpTypes.StoreProductCategory[] }>(
        "/store/product-categories",
        {
          method: "GET",
          query: { fields: "handle,name,parent_category_id", limit: 100 },
        }
      )
      .then((res) => {
        if (active && res?.product_categories) {
          setCategories(
            res.product_categories.filter((c) => !c.parent_category_id)
          )
        }
      })
      .catch(() => {
        // §24's graceful degradation — a category-list failure hides this
        // group rather than blocking the listing beside it.
      })
    return () => {
      active = false
    }
  }, [hideCategories])

  const updateQueryParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      updater(params)

      params.delete("page")

      const queryString = params.toString()
      const currentQuery = searchParams.toString()
      const nextPath = queryString ? `${pathname}?${queryString}` : pathname
      const currentPath = currentQuery
        ? `${pathname}?${currentQuery}`
        : pathname

      if (nextPath !== currentPath) {
        router.push(nextPath)
      }
    },
    [pathname, router, searchParams]
  )

  const selectedOptionValueIds = useMemo(
    () => parseOptionValueIds(searchParams),
    [searchParams]
  )

  const setOptionValueIds = (valueIds: string[]) =>
    updateQueryParams((params) => {
      params.delete(OPTION_VALUE_QUERY_KEY)
      valueIds.forEach((valueId) =>
        params.append(OPTION_VALUE_QUERY_KEY, valueId)
      )
    })

  const showCategories = !hideCategories && categories.length > 0

  if (!showCategories && hideOptionsPicker) {
    return null
  }

  return (
    <aside
      className="w-full small:w-[240px] small:shrink-0"
      aria-label="Filters"
      data-testid="refinement-list"
    >
      {showCategories && (
        <Accordion.Root
          type="multiple"
          value={openGroups}
          onValueChange={(v) => setOpenGroups(v as string[])}
        >
          <Accordion.Item value="category" className="border-b border-divider">
            <Accordion.Header>
              <Accordion.Trigger
                className="group flex w-full items-center justify-between gap-2 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                data-testid="filter-category-trigger"
              >
                Category
                <ChevronDownMini
                  aria-hidden="true"
                  className="text-text-muted transition-transform duration-150 group-data-[state=open]:rotate-180"
                />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="overflow-hidden">
              <ul className="flex flex-col gap-1 pb-4">
                {categories.map((category) => (
                  <li key={category.id}>
                    <LocalizedClientLink
                      href={`/categories/${category.handle}`}
                      className={clsx(
                        "flex min-h-[36px] items-center border-l-2 pl-3 text-caption transition-colors duration-standard ease-in-out hover:text-primary",
                        pathname?.includes(`/categories/${category.handle}`)
                          ? "border-l-primary font-semibold text-primary"
                          : "border-l-transparent text-text-secondary"
                      )}
                      data-testid="filter-category-link"
                    >
                      {category.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      )}

      {!hideOptionsPicker && (
        <OptionsPicker
          selectedValueIds={selectedOptionValueIds}
          setOptionValueIds={setOptionValueIds}
        />
      )}
    </aside>
  )
}

export default RefinementList
