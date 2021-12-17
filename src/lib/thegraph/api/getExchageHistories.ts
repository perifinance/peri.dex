import { exchangeHistories } from '../queries'
import { chartRate } from '../queries/rate'
import { get } from '../service'
import { utils } from 'ethers'
export const getExchageHistories = async ({currencyName = null, address, page = 0}) => {
    let histories = await get(exchangeHistories({currencyName, address, page}));
    for await (let history of histories) {
        
        if(history.srcRoundIdAtPeriodEnd !== "0"){
            try {
                history.srcRate = history.src === 'pUSD' ? {price: '1'} : (await get(chartRate({currencyName: history.src , page: history.srcRoundIdAtPeriodEnd, first: 1})))[0]
                history.destRate = history.dest === 'pUSD' ? {price: '1'} : (await get(chartRate({currencyName: history.dest , page: history.destRoundIdAtPeriodEnd, first: 1})))[0]
                const exchangeRates = BigInt(history.destRate.price) * 10n ** 18n / BigInt(history.srcRate.price);
                
                history.rate = 10n ** 18n * 10n ** 18n / (exchangeRates)
            } catch(e) {
                history.rate = 0n
            }
            
        } else {
            try {
                history.srcRate = history.src === 'pUSD' ? {price: '1'} : (await get(chartRate({currencyName: history.src , page: history.roundIdForSrc-1, first: 1})))[0]
                history.destRate = history.dest === 'pUSD' ? {price: '1'} : (await get(chartRate({currencyName: history.dest , page: history.roundIdForDest-1, first: 1})))[0]
                const exchangeRates = BigInt(history.destRate.price) * 10n ** 18n / BigInt(history.srcRate.price);
                history.rate = 10n ** 18n * 10n ** 18n / (exchangeRates)
            } catch(e) {
                history.rate = 0n
            }
        }
        
    }
    
    return histories
}