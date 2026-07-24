import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"

import Divider from "@modules/common/components/divider"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  return (
    <div>
      <Heading level="h2" className="flex flex-row text-heading-1 my-6">
        Delivery
      </Heading>
      {/* Same real bug as checkout's Addresses summary panel: an
          unconditional 3-column row with no responsive stacking squeezed
          every column to ~1/3 of even a narrow mobile viewport. */}
      <div className="flex flex-col small:flex-row items-start gap-6 small:gap-x-8">
        <div
          className="flex flex-col w-full small:w-1/3"
          data-testid="shipping-address-summary"
        >
          <Text className="txt-medium-plus text-text-primary mb-1">
            Shipping Address
          </Text>
          <Text className="txt-medium text-text-secondary">
            {order.shipping_address?.first_name}{" "}
            {order.shipping_address?.last_name}
          </Text>
          <Text className="txt-medium text-text-secondary">
            {order.shipping_address?.address_1}
            {order.shipping_address?.address_2 &&
              `, ${order.shipping_address.address_2}`}
          </Text>
          <Text className="txt-medium text-text-secondary">
            {order.shipping_address?.city}, {order.shipping_address?.province}
          </Text>
        </div>

        <div
          className="flex flex-col w-full small:w-1/3"
          data-testid="shipping-contact-summary"
        >
          <Text className="txt-medium-plus text-text-primary mb-1">Contact</Text>
          <Text className="txt-medium text-text-secondary">
            {order.shipping_address?.phone}
          </Text>
          <Text className="txt-medium text-text-secondary break-all">{order.email}</Text>
        </div>

        <div
          className="flex flex-col w-full small:w-1/3"
          data-testid="shipping-method-summary"
        >
          <Text className="txt-medium-plus text-text-primary mb-1">Method</Text>
          <Text className="txt-medium text-text-secondary">
            {(order.shipping_methods?.[0] as { name?: string })?.name} (
            {convertToLocale({
              amount: order.shipping_methods?.[0].total ?? 0,
              currency_code: order.currency_code,
            })}
            )
          </Text>
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default ShippingDetails
