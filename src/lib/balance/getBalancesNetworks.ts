import { SUPPORTED_NETWORKS } from '../network'
import perifinance from '@perifinance/peri-finance'
import ERC20 from '../contract/abi/ERC20.json'
import { RPC_URLS } from '../rpcUrl'
import { ethers, providers } from 'ethers'
export const getBalancesNetworks = async (networks, currentWallet, name) => {
    const apis = [];
    const ProxyERC20 = {
        1: 'PeriFinanceToEthereum',
        5: 'PeriFinanceToEthereum',
        42: 'PeriFinanceToEthereum',
        56: 'PeriFinanceToBSC',
        97: 'PeriFinanceToBSC',
        137: 'PeriFinanceToPolygon',
        1287: 'PeriFinance',
        80001: 'PeriFinanceToPolygon'
    };

    
    networks.forEach(network => {
        const sources = perifinance.getSource({network: SUPPORTED_NETWORKS[network.id].toLowerCase()})[name === 'ProxyERC20'? ProxyERC20[network.id] : name];
        const provider = new providers.JsonRpcProvider(RPC_URLS[network.id], network.id);
        const Address = perifinance.getTarget({network: SUPPORTED_NETWORKS[network.id || network].toLowerCase()})[name].address;
        
        const contract = new ethers.Contract(Address, sources ? sources.abi : ERC20.abi, provider);
        apis.push(
            contract.transferablePeriFinance ? contract.transferablePeriFinance(currentWallet) : contract.balanceOf(currentWallet)
            
        );
    });


    
    return await Promise.all(apis);
}