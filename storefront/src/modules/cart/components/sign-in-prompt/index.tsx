import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="bg-white flex items-center justify-between">
      <div>
        <Heading level="h2" className="txt-xlarge">
          Already have an account?
        </Heading>
        <Text className="txt-medium text-ui-fg-subtle mt-2">
          Sign in for a better experience.
        </Text>
      </div>
      <div>
        {/* A `<Button>` nested inside this link would be a second,
            redundant interactive element inside the same link — the same
            anti-pattern already fixed in `cart/templates/summary.tsx`'s
            checkout link. The link carries the button's own visual
            classes directly instead. */}
        <LocalizedClientLink
          href="/account"
          data-testid="sign-in-button"
          className="inline-flex gap-2 items-center justify-center rounded-radius-md font-medium transition-colors duration-standard ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 bg-surface-elevated text-text-primary border border-border hover:bg-ink-100 min-h-[44px] px-4 text-body h-10"
        >
          Sign in
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
