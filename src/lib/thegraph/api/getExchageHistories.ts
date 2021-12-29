import { exchangeHistories } from '../queries'
import { chartRate } from '../queries/rate'
import { get } from '../service'
import { utils } from 'ethers'

export const getExchageHistories = async ({currencyName = null, address, page = 0, first = 1000}) => {
    let histories = await get(exchangeHistories({currencyName, address, page, first}));
    return histories
}