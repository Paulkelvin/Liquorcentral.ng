/**
 * Cross-tab cart synchronization.
 *
 * **The bug this fixes.** Each browser tab holds its own copy of the cart
 * in React state (`CartProvider`'s `useOptimistic`), seeded once from the
 * server on that tab's own render. There is no channel between tabs, so
 * two tabs open on the same cart (same cart cookie) silently drift:
 * Tab A increments a line to 2 and tells the server; Tab B never hears
 * about it and still holds 1. If Tab B then increments too, it computes
 * "1 + 1 = 2" from its own stale value — not "2 + 1 = 3" — and the
 * request it sends *sets* the quantity to 2, silently overwriting Tab
 * A's real change. Whichever tab's stale read reaches the server last
 * wins; the other tab's edit is lost with no error, no warning.
 *
 * **The fix.** `localStorage` is shared across same-origin tabs, and the
 * native `storage` event fires in every *other* tab (never the one that
 * made the write) the instant a key changes — a well-established,
 * dependency-free way to signal across tabs without polling or a
 * WebSocket. Every client-side cart mutation calls `broadcastCartChange`
 * once it's confirmed with the server; `useCartBroadcastListener` (used
 * once, in `CartProvider`) reacts in every *other* tab by refreshing the
 * page's server data, which re-fetches the authoritative cart and flows
 * back down through `initialCart` — the same mechanism that already
 * reconciles a single tab's own optimistic state with the server.
 */
const STORAGE_KEY = "lc_cart_sync"

export function broadcastCartChange() {
  if (typeof window === "undefined") {
    return
  }
  try {
    // The value only has to change; nothing reads it back, `storage`
    // fires on the write itself. Timestamped so two writes in the same
    // millisecond in different tabs never collide on an identical value
    // (a `storage` event only fires when the value actually changes).
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()))
  } catch {
    // Private browsing / storage disabled — cross-tab sync is a nicety,
    // not a requirement; this tab's own state is unaffected either way.
  }
}

export function onCartChangedInAnotherTab(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {}
  }
  const handler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      callback()
    }
  }
  window.addEventListener("storage", handler)
  return () => window.removeEventListener("storage", handler)
}
