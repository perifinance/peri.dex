import { mainnet } from './networks/mainnet'
import { bsc } from './networks/bsc'
import { bsctest } from './networks/bsctest'
import { polygon } from './networks/polygon'

const api = {
    1: mainnet,
	3: mainnet,
	4: mainnet,
	5: mainnet,
	42: mainnet,
	56: bsc,
	97: bsctest,
	137: polygon,
	80001: polygon
}
export const getNetworkFee = async (networkId) => {
    const gasfee = await api[networkId]();
    return BigInt(gasfee * 1000000000);
}