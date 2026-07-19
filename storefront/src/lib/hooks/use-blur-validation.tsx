"use client"

import { useState, useCallback } from "react"

/**
 * Form foundation (Phase 0c — Storefront Foundation): the concrete
 * "validate on blur, not on every keystroke" rule DESIGN_SYSTEM.md §B9
 * requires ("avoids interrupting someone mid-entry"). This hook holds no
 * business validation logic of its own — the caller supplies a `validate`
 * function; this hook only controls *when* that function's result is
 * allowed to surface as a visible error (after the field has been blurred
 * at least once, and on every change after that point, so a fix is
 * acknowledged immediately rather than requiring a second blur).
 */
export function useBlurValidation<T>(
  validate: (value: T) => string | undefined
) {
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const onBlur = useCallback(
    (value: T) => {
      setTouched(true)
      setError(validate(value))
    },
    [validate]
  )

  const onChange = useCallback(
    (value: T) => {
      if (touched) {
        setError(validate(value))
      }
    },
    [touched, validate]
  )

  return { error: touched ? error : undefined, onBlur, onChange }
}
