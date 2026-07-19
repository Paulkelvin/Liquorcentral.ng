import { groupCategoriesForMegaMenu } from "../mega-menu"
import { HttpTypes } from "@medusajs/types"

const category = (
  id: string,
  name: string,
  rank: number,
  children: HttpTypes.StoreProductCategory[] = []
): HttpTypes.StoreProductCategory =>
  ({
    id,
    name,
    rank,
    parent_category_id: null,
    category_children: children,
  } as HttpTypes.StoreProductCategory)

describe("groupCategoriesForMegaMenu", () => {
  it("distributes top-level categories round-robin across columns, ordered by rank", () => {
    const wines = category("1", "Wines", 0)
    const champagne = category("2", "Champagne", 1)
    const spirits = category("3", "Spirits", 2, [
      { id: "s1", name: "Whisky" } as HttpTypes.StoreProductCategory,
    ])
    const beer = category("4", "Beer", 3)
    const giftSets = category("5", "Gift Sets", 4)
    const accessories = category("6", "Accessories", 5)

    const columns = groupCategoriesForMegaMenu(
      [accessories, spirits, wines, giftSets, champagne, beer],
      3
    )

    expect(columns).toHaveLength(3)
    // Round-robin by rank: col0=[Wines,Beer], col1=[Champagne,Gift Sets], col2=[Spirits,Accessories]
    expect(columns[0].map((g) => g.heading.name)).toEqual(["Wines", "Beer"])
    expect(columns[1].map((g) => g.heading.name)).toEqual([
      "Champagne",
      "Gift Sets",
    ])
    expect(columns[2].map((g) => g.heading.name)).toEqual([
      "Spirits",
      "Accessories",
    ])
    expect(columns[2][0].links).toHaveLength(1)
  })

  it("never produces more columns than there are top-level categories", () => {
    const columns = groupCategoriesForMegaMenu(
      [category("1", "Wines", 0), category("2", "Beer", 1)],
      3
    )

    expect(columns).toHaveLength(2)
  })

  it("excludes non-top-level categories from becoming their own column", () => {
    const child = {
      id: "c1",
      name: "Whisky",
      rank: 0,
      parent_category_id: "3",
    } as HttpTypes.StoreProductCategory
    const spirits = category("3", "Spirits", 0, [child])

    const columns = groupCategoriesForMegaMenu([spirits, child], 3)

    expect(columns).toHaveLength(1)
    expect(columns[0][0].heading.name).toBe("Spirits")
  })

  it("returns an empty array when no categories exist", () => {
    expect(groupCategoriesForMegaMenu([], 3)).toEqual([])
  })
})
