import { contracts } from '../contract'
import { utils } from 'ethers';

export const getExchangeRates = async (key: string) => {
    
    const {
        ExchangeRates,
	} = contracts as any;
    
    return BigInt((await ExchangeRates.rateForCurrency(utils.formatBytes32String(key))).toString());    
}