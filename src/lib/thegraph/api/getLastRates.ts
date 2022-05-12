import { lastRate } from '../queries'
import { get } from '../service'

export const getLastRates = ({currencyName = null}) => {
  // console.log("currencyName", currencyName);
  return get(lastRate({currencyName}))
}