import { renderHook, act } from "@testing-library/react"
import { useHoverIntentOpen } from "@lib/hooks/use-hover-intent-open"

describe("useHoverIntentOpen", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const makeTrigger = () => {
    const click = jest.fn()
    const ref = { current: { click } as unknown as HTMLButtonElement }
    return { ref, click }
  }

  it("does not click the trigger before the hover-intent delay elapses", () => {
    const { ref, click } = makeTrigger()
    const { result } = renderHook(() => useHoverIntentOpen(ref))

    act(() => {
      result.current.onMouseEnter(false)()
    })
    act(() => {
      jest.advanceTimersByTime(100)
    })

    expect(click).not.toHaveBeenCalled()
  })

  it("clicks the trigger once the hover-intent delay elapses", () => {
    const { ref, click } = makeTrigger()
    const { result } = renderHook(() => useHoverIntentOpen(ref))

    act(() => {
      result.current.onMouseEnter(false)()
    })
    act(() => {
      jest.advanceTimersByTime(150)
    })

    expect(click).toHaveBeenCalledTimes(1)
  })

  it("never schedules an open when already open", () => {
    const { ref, click } = makeTrigger()
    const { result } = renderHook(() => useHoverIntentOpen(ref))

    act(() => {
      result.current.onMouseEnter(true)()
    })
    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(click).not.toHaveBeenCalled()
  })

  it("cancels the pending open if the mouse leaves before the delay elapses", () => {
    const { ref, click } = makeTrigger()
    const { result } = renderHook(() => useHoverIntentOpen(ref))

    act(() => {
      result.current.onMouseEnter(false)()
    })
    act(() => {
      jest.advanceTimersByTime(50)
      result.current.onMouseLeaveCancel()
      jest.advanceTimersByTime(200)
    })

    expect(click).not.toHaveBeenCalled()
  })

  it("cancels the pending open if a real click arrives first — the exact race that caused the flash-open-then-close bug", () => {
    const { ref, click } = makeTrigger()
    const { result } = renderHook(() => useHoverIntentOpen(ref))

    act(() => {
      result.current.onMouseEnter(false)()
      jest.advanceTimersByTime(10)
      result.current.onTriggerClick()
      jest.advanceTimersByTime(500)
    })

    expect(click).not.toHaveBeenCalled()
  })
})
