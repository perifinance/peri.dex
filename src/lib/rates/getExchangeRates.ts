import { contracts } from '../contract'
import { utils } from 'ethers';
import { getDecimal } from 'lib/decimals/getDecimal'
export const getExchangeRates = async (key: string) => {
    
    const {
        ExchangeRates,
	} = contracts as any;
    const decimal = await getDecimal(key);
    
    if(decimal === 18n) {
        return BigInt((await ExchangeRates.rateForCurrency(utils.formatBytes32String(key))).toString());
    } else {
        return BigInt((await ExchangeRates.rateForCurrency(utils.formatBytes32String(key))).toString()) * 10n ** (18n - decimal);
    }
    
}