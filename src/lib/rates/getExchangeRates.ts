import { contracts } from '../contract'
import { utils } from 'ethers';

export const getExchangeRates = async () => {
    const {
        ExchangeRates,
	} = contracts as any;

    const PERI = BigInt((await ExchangeRates.rateForCurrency(utils.formatBytes32String('PERI'))).toString());
    const USDC = BigInt((await ExchangeRates.rateForCurrency(utils.formatBytes32String('USDC'))).toString());
    const DAI = BigInt((await ExchangeRates.rateForCurrency(utils.formatBytes32String('DAI'))).toString());
    return {
        PERI,
        USDC,
        DAI
    }
}