import { getExchangeRates } from './getExchangeRates'

export const getRatios = async (currentWallet) => {
    return {
        exchangeRates: await getExchangeRates(),
    }
}