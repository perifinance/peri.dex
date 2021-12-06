import { SUPPORTED_NETWORKS } from '../network'
import perifinance from '@perifinance/peri-finance'
import ERC20 from '../contract/abi/ERC20.json'
import { RPC_URLS } from '../rpcUrl'
import { ethers, providers } from 'ethers'
export const getpUSDBalances = async (networks, currentWallet) => {
    const contract = [];
    
    networks.forEach(network => {
        const provider = new providers.JsonRpcProvider(RPC_URLS[network.id], network.id);
        const {address} = perifinance.getTarget({network: SUPPORTED_NETWORKS[network.id || network].toLowerCase()}).ProxyERC20pUSD;
        contract.push(
            (new ethers.Contract(address, ERC20.abi, provider)).balanceOf(currentWallet)
        );
    });


    
    return await Promise.all(contract);
}