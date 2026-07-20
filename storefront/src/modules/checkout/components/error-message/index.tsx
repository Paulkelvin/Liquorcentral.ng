/**
 * 07_CHECKOUT_SPECIFICATION.md §21, §22 — "error announcements use the same
 * live-region mechanism" already established for cart totals and
 * payment-state changes — a failed step is announced audibly the moment it
 * fails, not left as a visual-only banner a screen-reader user could miss.
 */
const ErrorMessage = ({ error, 'data-testid': dataTestid }: { error?: string | null, 'data-testid'?: string }) => {
  if (!error) {
    return null
  }

  return (
    <div
      className="pt-2 text-rose-500 text-small-regular"
      role="alert"
      aria-live="assertive"
      data-testid={dataTestid}
    >
      <span>{error}</span>
    </div>
  )
}

export default ErrorMessage
