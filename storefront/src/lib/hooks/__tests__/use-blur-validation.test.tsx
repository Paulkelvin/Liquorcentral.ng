import { renderHook, act } from "@testing-library/react"
import { useBlurValidation } from "@lib/hooks/use-blur-validation"

describe("useBlurValidation", () => {
  const validate = (value: string) =>
    value.includes("@") ? undefined : "Enter a valid email address"

  it("shows no error before the field has been blurred", () => {
    const { result } = renderHook(() => useBlurValidation(validate))

    act(() => {
      result.current.onChange("not-an-email")
    })

    expect(result.current.error).toBeUndefined()
  })

  it("surfaces the error once the field is blurred (not on every keystroke)", () => {
    const { result } = renderHook(() => useBlurValidation(validate))

    act(() => {
      result.current.onBlur("not-an-email")
    })

    expect(result.current.error).toBe("Enter a valid email address")
  })

  it("re-validates on change after the first blur, so a fix clears immediately", () => {
    const { result } = renderHook(() => useBlurValidation(validate))

    act(() => {
      result.current.onBlur("not-an-email")
    })
    expect(result.current.error).toBe("Enter a valid email address")

    act(() => {
      result.current.onChange("now@valid.com")
    })
    expect(result.current.error).toBeUndefined()
  })
})
