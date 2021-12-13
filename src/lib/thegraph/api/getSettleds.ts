import { exchangeHistories } from '../queries'
import { chartRate } from '../queries/rate'
import { get } from '../service'
import { utils } from 'ethers'
export const getSettleds = async ({currencyName = null, address, page = 0}) => {
    let histories = await get(exchangeHistories({currencyName, address, page}));
    for await (let history of histories) {
        history.srcRate = history.src === 'pUSD' ? {price: '1'} : (await get(chartRate({currencyName: history.src , page: history.srcRoundIdAtPeriodEnd, first: 1})))[0]
        history.destRate = history.dest === 'pUSD' ? {price: '1'} : (await get(chartRate({currencyName: history.dest , page: history.destRoundIdAtPeriodEnd, first: 1})))[0]
        const exchangeRates = utils.parseEther(history.destRate.price).toBigInt() * 10n ** 18n / utils.parseEther(history.srcRate.price).toBigInt();
        
        history.rate = 10n ** 18n * 10n ** 18n / (exchangeRates)
        history.submitAmount = BigInt(history.amount) * history.rate / 10n ** 18n;
    }
    
    return histories
}