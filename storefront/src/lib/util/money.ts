import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
  /**
   * `"narrowSymbol"` renders NGN as "₦" instead of "NGN ". Opt-in, because
   * the long form is what every existing surface has been approved with;
   * the pairing banner uses it only because its price sits in a ~110px
   * column on a small phone, where "NGN 63,500" alone eats most of the row.
   */
  currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "name"
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
  currencyDisplay,
}: ConvertToLocaleParams) => {
  return currency_code && !isEmpty(currency_code)
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency_code,
        currencyDisplay,
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(amount)
    : amount.toString()
}
