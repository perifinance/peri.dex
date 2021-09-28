import { contracts } from '../contract'
import { utils } from 'ethers';

export const getFeeRateForExchange = async (sourceSymbol, destinationSymbol) => {
    
    const {
        Exchanger,
	} = contracts as any;
    console.log(Exchanger)
    return BigInt((await Exchanger.feeRateForExchange(utils.formatBytes32String(sourceSymbol), utils.formatBytes32String(destinationSymbol))).toString());    
}