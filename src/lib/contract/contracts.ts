import { SUPPORTED_NETWORKS } from '../network'
import { ethers, providers } from 'ethers'
import ERC20 from '../contract/abi/ERC20.json'
import { RPC_URLS } from '../rpcUrl'
import perifinance from '@perifinance/peri-finance'

const naming = {
    ExchangeRates: 'ExchangeRates',
    Exchanger: 'ExchangerWithVirtualPynth',
    ProxyERC20: {
        1: 'PeriFinanceToEthereum',
        5: 'PeriFinanceToEthereum',
        42: 'PeriFinanceToEthereum',
        56: 'PeriFinanceToBSC',
        97: 'PeriFinanceToBSC',
        137: 'PeriFinanceToPolygon',
        80001: 'PeriFinanceToPolygon'
    },
    ProxyERC20pUSD: 'Pynth',
    ProxyERC20pBTC: 'Pynth',
    ProxyERC20pETH: 'Pynth',
    SystemSettings: 'SystemSettings'
} 

type Contracts = {
    networkId: number,
    sources?: any,
    provider?: any,
    wallet?: any,
    ExchangeRates?: any
    Exchanger?: any
    PeriFinance?: any
    PynthpUSD?: any
    SystemSettings?: any
    init: (networkId: number) => void
    connect: (address:string) => void
    signers?: {
        Exchanger?: any
        ExchangeRates?: any
        PeriFinance?: any
        SystemSettings?: any
        PynthpUSD?: any
    }
}

export const contracts: Contracts = {
    networkId: null,
    wallet: null,
    signers: {},
    init(networkId) {
        if(networkId) {
            this.networkId = networkId;
        } else {
            return false;
        }
        this.sources = perifinance.getSource({network: SUPPORTED_NETWORKS[this.networkId].toLowerCase()});
        this.addressList = perifinance.getTarget({network: SUPPORTED_NETWORKS[this.networkId].toLowerCase()});
        this.provider = new providers.JsonRpcProvider(RPC_URLS[this.networkId], this.networkId);
        
        Object.keys(this.addressList).forEach(name => {
            if(naming[name]) {
                const source = typeof naming[name] === 'string' ? this.sources[naming[name]] : this.sources[naming[name][this.networkId]]
                this[name] = new ethers.Contract(this.addressList[name].address, source ? source.abi : ERC20.abi, this.provider);
                
                if(name === 'ProxyERC20') {
                    this['PeriFinance'] = this[name];
                }
            }
        });
    },

    connect(address) {
        this.signer = new providers.Web3Provider(this.wallet.provider).getSigner(address);
        
        Object.keys(this.addressList).forEach(name => {
            if(naming[name]) {
                const source = typeof naming[name] === 'string' ? this.sources[naming[name]] : this.sources[naming[name][this.networkId]]
                this.signers[name] = new ethers.Contract(this.addressList[name].address, source ? source.abi : ERC20.abi, this.signer);
                if(name === 'ProxyERC20') {
                    this.signers['PeriFinance'] = this.signers[name];
                }
            }
        });
    }
}