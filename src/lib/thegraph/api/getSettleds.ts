import { exchangeHistories } from '../queries'
import { get } from '../service'

export const getSettleds = ({currencyName = null, address, page = 0}) => {
    return get(exchangeHistories({currencyName, address, page}))
}