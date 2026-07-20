import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import WhatsAppNotificationProviderService from "./service"

export default ModuleProvider(Modules.NOTIFICATION, {
  services: [WhatsAppNotificationProviderService],
})
