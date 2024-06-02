import { toWei } from 'web3-utils'
import { mainnet } from './networks/mainnet'
import { bsc } from './networks/bsc'
import { moonbeam, moonriver } from './networks/moonbeam'
// import { bsctest } from './networks/bsctest'
import { polygon } from './networks/polygon'
import { getGasPrice, testGasPrice } from './getGasPrice'

const api = {
    1: mainnet,
	3: mainnet,
	4: mainnet,
	5: mainnet,
	42: mainnet,
	56: bsc,
	97: testGasPrice,
	137: polygon,
	1284: moonbeam,
	1285: moonriver,
	1287: testGasPrice,
	80001: testGasPrice,
	8453: getGasPrice,
	84532: testGasPrice,
	11155111: mainnet,
}
export const getNetworkFee = async (networkId): Promise<string> => {
	// console.log("getNetworkFee", networkId);
	try {
		const gasPrice = await api[networkId](networkId);
		const gasFee = (parseInt(gasPrice) > 1
			? Math.round(Number(gasPrice))
			: Math.round(Number(gasPrice) * 1e9) / 1e9
		).toString();

		console.log("gasFee", gasFee);
		return gasFee;
	} catch (e) {}
	
    return '0';
}