import { RPC_URLS } from 'lib/rpcUrl'
import { providers, Contract } from 'ethers'
import { contracts } from 'lib/contract'
const networks = [ 1, 56, 137 ];

const debtCacheAddress = {
    1: '0x9cec55DEDf0F59dDCe77c1c9067fA92f256202Fd',
    56: '0xa960A3FB10349637e0401547380d05DFeFbf60f8',
    137: '0x2CC685fc9C1574fE8400548392067eC0B9eA1095'
}

export const getTotalDebtCache = async () => {
    let values = {
        56: 0n,
        137: 0n, 
        total: 0n,
    };

    for await (let networkId of networks) {
        if(debtCacheAddress[networkId]) {
            const provider = new providers.JsonRpcProvider(RPC_URLS[networkId], networkId);
            const contract = new Contract(debtCacheAddress[networkId], contracts.sources.DebtCache.abi, provider);
            let value = 0n;
            try {
                value = BigInt((await contract.cachedDebt()).toString());
            } catch (e) {
                value = 0n;
            }
            values[networkId] = value;
            values['total'] = values['total'] + value;
        }
        
    }
    return values;
}