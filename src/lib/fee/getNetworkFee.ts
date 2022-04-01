import { mainnet } from './networks/mainnet'
import { bsc } from './networks/bsc'
// import { bsctest } from './networks/bsctest'
import { polygon } from './networks/polygon'

const api = {
    1: mainnet,
	3: mainnet,
	4: mainnet,
	5: mainnet,
	42: mainnet,
	56: bsc,
	97: () => 13n,
	137: polygon,
	1287: () => 3n,
	80001: () => 3n
}
export const getNetworkFee = async (networkId): Promise<bigint> => {
	const gasFee = await api[networkId]();
    return BigInt(gasFee);
}