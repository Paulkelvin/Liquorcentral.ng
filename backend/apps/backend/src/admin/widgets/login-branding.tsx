import { defineWidgetConfig } from "@medusajs/admin-sdk"
import "../styles/auth-branding.css"

const LoginBranding = () => {
  return null
}

export const config = defineWidgetConfig({
  zone: "login.before",
})

export default LoginBranding
