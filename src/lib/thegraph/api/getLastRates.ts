import { lastRate } from '../queries'
import { get } from '../service'

export const getLastRates = ({currencyName = null}) => {
  return get(lastRate({currencyName}))
}