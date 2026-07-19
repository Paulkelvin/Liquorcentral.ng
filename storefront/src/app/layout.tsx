import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import { ToastProvider } from "@modules/common/components/toast"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
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
