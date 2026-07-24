import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { DM_Sans, Source_Serif_4 } from "next/font/google"
import "styles/globals.css"
import { ToastProvider } from "@modules/common/components/toast"

/**
 * BRAND_IDENTITY.md §14 / DESIGN_SYSTEM.md §B1: a humanist sans for body
 * text and "a warm serif/slab display face, used sparingly" for headings —
 * previously unfilled (the config named "Inter" and a generic system-serif
 * stack but never actually loaded either as a real webfont, so both silently
 * fell through to whatever sans/serif the visitor's OS happened to have).
 * next/font/google self-hosts these at build time (no runtime request to
 * Google, no layout-shift flash) and exposes them as CSS variables that
 * `tailwind.config.js`'s `fontFamily.sans`/`fontFamily.display` already
 * reference — no component using those utilities needs to change.
 */
const bodyFont = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
})

const displayFont = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body className="bg-surface font-sans text-text-primary">
        {/*
         * Not a <main> landmark here — each locale-level layout ((main),
         * (checkout)) owns the single <main> landmark for its own page
         * tree, since they render genuinely different page structures.
         * ToastProvider is mounted once at the true root so any future
         * feature can call useToast() regardless of which route group
         * it's rendered under.
         */}
        <ToastProvider>
          <div className="relative">{props.children}</div>
        </ToastProvider>
      </body>
    </html>
  )
}
