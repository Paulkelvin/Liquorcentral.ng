import { Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * Deliberately the quietest thing on the cart page. This is an optional
 * convenience, not a step in the purchase — as a bordered card with a
 * heading and an outlined button it outranked the customer's own items,
 * which is the one thing the cart must never do. Now a tinted strip with
 * a single inline text action.
 */
const SignInPrompt = () => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-radius-md bg-ink-100 px-4 py-3">
      <Text className="!text-[13px] text-text-secondary">
        Already have an account? Sign in for a faster checkout.
      </Text>
      <LocalizedClientLink
        href="/account"
        className="text-[13px] font-medium text-text-primary underline underline-offset-2 transition-colors duration-standard ease-in-out hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        data-testid="sign-in-button"
      >
        Sign in
      </LocalizedClientLink>
    </div>
  )
}

export default SignInPrompt
