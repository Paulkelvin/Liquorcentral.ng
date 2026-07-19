import { Module } from "@medusajs/framework/utils"
import WineDetailsModuleService from "./service"

export const WINE_DETAILS_MODULE = "wine_details"

export default Module(WINE_DETAILS_MODULE, {
  service: WineDetailsModuleService,
})
