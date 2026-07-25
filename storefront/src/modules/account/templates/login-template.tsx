"use client"

import { useState } from "react"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import ForgotPassword from "@modules/account/components/forgot-password"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
  FORGOT_PASSWORD = "forgot-password",
}

/**
 * A quiet geometric watermark behind the panel — the same concentric-ring
 * motif the homepage hero uses, so the two read as one visual family.
 * Drawn with real SVG `opacity` attributes rather than Tailwind's
 * colour-opacity modifiers, which emit no CSS at all against this
 * project's `var()`-based palette.
 */
function Watermark() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 600 600"
      className="pointer-events-none absolute left-1/2 top-1/2 h-[min(150vw,780px)] w-[min(150vw,780px)] -translate-x-1/2 -translate-y-1/2"
    >
      <g fill="none" stroke="var(--color-text-primary)" strokeWidth="1">
        <circle cx="300" cy="300" r="120" opacity="0.055" />
        <circle cx="300" cy="300" r="185" opacity="0.045" />
        <circle cx="300" cy="300" r="250" opacity="0.03" />
      </g>
    </svg>
  )
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState<string>(LOGIN_VIEW.SIGN_IN)

  return (
    <div className="relative isolate overflow-hidden px-4 py-12 small:py-16">
      {/* Ambient wash behind the panel, mixed from the brand tokens with
          `color-mix` rather than an opacity modifier — same reason as the
          watermark above. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--color-primary) 7%, transparent) 0%, transparent 60%), radial-gradient(90% 60% at 50% 100%, color-mix(in srgb, var(--color-secondary) 6%, transparent) 0%, transparent 65%)",
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <Watermark />
      </div>

      <div className="mx-auto w-full max-w-[420px]">
        <div className="rounded-[12px] border border-border bg-surface-elevated p-6 shadow-elevation-2 small:p-8">
          {currentView === LOGIN_VIEW.SIGN_IN && (
            <Login setCurrentView={setCurrentView} />
          )}
          {currentView === LOGIN_VIEW.REGISTER && (
            <Register setCurrentView={setCurrentView} />
          )}
          {currentView === LOGIN_VIEW.FORGOT_PASSWORD && (
            <ForgotPassword setCurrentView={setCurrentView} />
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginTemplate
