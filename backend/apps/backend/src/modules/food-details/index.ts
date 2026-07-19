import { Module } from "@medusajs/framework/utils"
import FoodDetailsModuleService from "./service"

export const FOOD_DETAILS_MODULE = "food_details"

export default Module(FOOD_DETAILS_MODULE, {
  service: FoodDetailsModuleService,
})
