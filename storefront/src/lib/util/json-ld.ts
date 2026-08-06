/**
 * Serializes a value for embedding inside a `<script type="application/ld+json">`
 * tag.
 *
 * `JSON.stringify` alone is not safe here: it does not escape `<`, so any
 * field sourced from editable content — a product title, a description —
 * that happens to contain the literal substring `</script>` would close
 * the script tag early and let whatever follows it be parsed as HTML,
 * up to and including a second, attacker-controlled `<script>`. This is
 * a well-known class of bug in storefronts that embed product data as
 * JSON-LD (structured-data injection). Escaping `<` as its unicode
 * escape neutralizes it without changing the JSON's meaning — `<`
 * decodes back to `<` wherever a JSON parser reads it, but the raw HTML
 * parser never sees a literal `<` to act on.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}
