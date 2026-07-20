import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import PaystackPaymentProviderService from "./service"

export default ModuleProvider(Modules.PAYMENT, {
  services: [PaystackPaymentProviderService],
})
