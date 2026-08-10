import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect, useRef } from "react"
import "../styles/auth-branding.css"
import logoUrl from "../assets/liquorcentral-logo.png"

const LoginBranding = () => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const container = ref.current.closest(".items-center")
    if (!container) return

    const existing = container.querySelector(".lc-logo")
    if (existing) return

    const logo = document.createElement("img")
    logo.src = logoUrl
    logo.alt = "LiquorCentral"
    logo.className = "lc-logo"
    logo.style.cssText =
      "width: 200px; height: auto; margin-bottom: 20px; object-fit: contain;"

    container.insertBefore(logo, container.firstChild)

    return () => {
      logo.remove()
    }
  }, [])

  return <div ref={ref} style={{ display: "none" }} />
}

export const config = defineWidgetConfig({
  zone: "login.before",
})

export default LoginBranding
