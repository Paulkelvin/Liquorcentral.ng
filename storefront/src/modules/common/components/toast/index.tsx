"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react"
import { clx } from "@modules/common/components/ui"

/**
 * Toast / notification infrastructure (Phase 0c — Storefront Foundation).
 * A generic, accessible toast mechanism every future feature (add-to-cart
 * confirmation, form save, a delivery-slot capacity error, etc.) can call
 * into via `useToast()` — no specific message or trigger is wired up here,
 * since that behavior belongs to whichever specification eventually needs
 * it. DESIGN_SYSTEM.md §B9 explicitly requires inline confirmation *in
 * addition to* a toast, never a toast alone — this component supplies the
 * toast half of that pair, not a replacement for it.
 */

export type ToastVariant = "success" | "danger" | "warning" | "information"

export type Toast = {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

type ToastInput = Omit<Toast, "id">

type ToastContextValue = {
  toasts: Toast[]
  showToast: (toast: ToastInput) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const DEFAULT_DURATION_MS = 5000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (toast: ToastInput) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`

      setToasts((current) => [...current, { ...toast, id }])

      window.setTimeout(() => dismissToast(id), DEFAULT_DURATION_MS)
    },
    [dismissToast]
  )

  const value = useMemo(
    () => ({ toasts, showToast, dismissToast }),
    [toasts, showToast, dismissToast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}

const variantClass: Record<ToastVariant, string> = {
  success: "border-success text-success",
  danger: "border-danger text-danger",
  warning: "border-warning text-warning",
  information: "border-information text-information",
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[]
  onDismiss: (id: string) => void
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={clx(
            "pointer-events-auto rounded-radius-md border bg-surface-elevated shadow-elevation-2 p-4 animate-fade-in-top",
            variantClass[toast.variant]
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-body font-medium text-text-primary">
                {toast.title}
              </p>
              {toast.description && (
                <p className="text-caption text-text-secondary mt-1">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="text-text-muted hover:text-text-primary min-h-[24px] min-w-[24px]"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
