import Onboard from 'bnc-onboard'
import { RPC_URLS } from '../rpcUrl'

export let onboard;

export const InitOnboard = (networkId, subscriptions, darkMode) => {
    // const dappId:string = import.meta.env.VITE_RPC_ONBOARD_ID;
    // onboard = Onboard({
    //     dappId: dappId,
    //     hideBranding: false,
    //     networkId: networkId,
    //     darkMode,
    //     subscriptions,
    //     walletSelect: {
    //         wallets: [
    //         { walletName: 'detectedwallet' },
    //         { walletName: 'metamask' , rpcUrl: RPC_URLS[networkId]},
    //         {
    //             walletName: 'trezor',
    //             email: 'peri@pynths.com',
    //             appUrl: 'https://staking.peri.finance',
    //             rpcUrl: RPC_URLS[networkId]
    //         },
    //         {
    //             walletName: 'ledger',
    //             rpcUrl: RPC_URLS[networkId]
    //         },
    //         // @ts-ignore
    //         {
    //             walletName: 'walletConnect',
    //             infuraKey: import.meta.env.INFURA_ID,
    //             rpcUrl: RPC_URLS[networkId]
    //         },
            
    //         // {
    //         //     walletName: 'lattice',
    //         //     appName: 'PERI FINANCE STAKING',
    //         //     rpcUrl: RPC_URLS[networkId]
    //         // },
    //         { walletName: 'coinbase' },
    //         // { walletName: 'status' },
    //         // { walletName: 'walletLink', rpcUrl: RPC_URLS[networkId] },

            
    //         {
    //             walletName: 'portis',
    
    //             apiKey: import.meta.env.VITE_VITE_PORTIS_ID
    //         },

    //         { walletName: 'fortmatic', apiKey: import.meta.env.VITE_FORTMATIC_ID },

    //         // { walletName: 'torus' },
    //         // { walletName: 'trust', rpcUrl: RPC_URLS[networkId] },
    //         // { walletName: 'opera' },
    //         // { walletName: 'operaTouch' },
    //         { walletName: 'imToken', rpcUrl: RPC_URLS[networkId] },
    //         // { walletName: 'meetone' },
    //         // { walletName: 'mykey', rpcUrl: RPC_URLS[networkId] },
    //         // { walletName: 'wallet.io', rpcUrl: RPC_URLS[networkId] },
    //         // { walletName: 'huobiwallet', rpcUrl: RPC_URLS[networkId] },
    //         // { walletName: 'hyperpay' },
    //         // { walletName: 'atoken' },
    //         // { walletName: 'liquality' },
    //         // { walletName: 'frame' },
    //         // { walletName: 'tokenpocket', rpcUrl: RPC_URLS[networkId] },
    //         // { walletName: 'authereum', disableNotifications: true },
    //         // { walletName: 'ownbit' },
    //         // { walletName: 'gnosis' },
    //         // { walletName: 'bitpie' },
    //         // { walletName: 'xdefi' },
    //         // { walletName: 'keepkey', rpcUrl: RPC_URLS[networkId] }
    //         ]
    //     },
    //     walletCheck: [
	// 		{ checkName: 'derivationPath' },
	// 		{ checkName: 'accounts' },
	// 		{ checkName: 'connect' },
	// 	],
    // }
// )
}