import type { WalletInit } from "@web3-onboard/common";
import init from "@web3-onboard/core";
import enkryptModule from "@web3-onboard/enkrypt";
import injectedModule, { ProviderLabel } from "@web3-onboard/injected-wallets";
import infinityWalletModule from "@web3-onboard/infinity-wallet";
import gnosisModule from "@web3-onboard/gnosis";
import keepkeyModule from "@web3-onboard/keepkey";
import portisModule from "@web3-onboard/portis";
import keystoneModule from "@web3-onboard/keystone";
import trezorModule from "@web3-onboard/trezor";
import walletConnectModule from "@web3-onboard/walletconnect";
import coinbaseWalletModule from "@web3-onboard/coinbase";
import trustModule from "@web3-onboard/trust";
import frontierModule from "@web3-onboard/frontier";
import mewWallet from "@web3-onboard/mew-wallet";
import fortmatic from "@web3-onboard/fortmatic";
import safeModule from "@web3-onboard/gnosis";
import { OnboardAPI } from "@web3-onboard/core";
import { BuiltInThemes, WalletState } from "@web3-onboard/core/dist/types";
import { Chain } from "@web3-onboard/common/dist/types";
import ledgerModule from "@web3-onboard/ledger";
import metamaskSDK from "@web3-onboard/metamask";

import { NotificationManager } from "react-notifications";

import { networkInfo } from "configure/networkInfo";

import { MAINNET, TESTNET, UNPOPULARNET } from "lib/network/supportedNetWorks";

type Web3Onboard = {
    onboard: OnboardAPI;
    unsubscribe: any;
    selectedAddress: string;
    selectedNetwork: string;
    init: (subscriptions: any, colorMode: string, autoConnect: boolean) => void;
    connect: (walletLabel: any) => Promise<void>;
    disconnect: () => void;
    address: (address: any) => void;
    network: (networkId: any) => void;
    wallet: (wallet: WalletState) => void;
    _onWalletUpdated: (wallets: WalletState[]) => void;
    // _onChainUpdated: (chains: Chain[]) => void;
};

export const web3Onboard: Web3Onboard = {
    onboard: null,
    unsubscribe: null,
    address: undefined,
    network: undefined,
    wallet: undefined,
    selectedAddress: undefined,
    selectedNetwork: undefined,
    init(subscriptions, colorMode = "light", autoConnect = false) {
        this.address = subscriptions.address;
        this.network = subscriptions.network;
        this.wallet = subscriptions.wallet;

        // console.log(process.env.REACT_APP_RPC_ONBOARD_ID);

        // initialize the module with options
        const metamaskSDKWallet = metamaskSDK({
            options: {
                extensionOnly: false,
                // injectProvider: true,
                infuraAPIKey: process.env.REACT_APP_INFURA_ID,
                dappMetadata: {
                    url: "https://dex.peri.finance",
                    name: "PERI Finance DEX",
                },
            },
        });

        const wcV2InitOptions = {
            projectId: process.env.REACT_APP_RPC_ONBOARD_ID,
            version: 2,
            qrModalOptions: {
                enableAuthMode: true,
            },
            requiredChains: [1, 137]/* Object.keys(process.env.REACT_APP_ENV === 'production' ? MAINNET : TESTNET).filter(
                (networkId) => UNPOPULARNET[networkId] === undefined && networkId !== "1337"
              ) */,
            optionalChains: Object.keys(process.env.REACT_APP_ENV === 'production' ? MAINNET : TESTNET).filter(
                (networkId) => !["1", "137", "1337"].includes(networkId) ),
            // requiredChains: Object.keys(process.env.REACT_APP_ENV === 'production' ? MAINNET : TESTNET).filter((networkId) => {
            //     return UNPOPULARNET[networkId] === undefined;
            // }),
            
            // optionalChains: Object.keys(UNPOPULARNET).map((networkId) => networkId),
            dappUrl: "https://dex.peri.finance",
            additionalOptionalMethods: ["wallet_switchEthereumChain", "wallet_addEthereumChain"],
        };

        // initialize the module with options
        const coinbase = coinbaseWalletModule();
        const safe = safeModule();
        // If version isn't set it will default to V1 until V1 sunset
        const walletConnect = walletConnectModule(/* wcV1InitOptions ||  */ wcV2InitOptions);
        const fortmaticModule = fortmatic({
            apiKey: process.env.REACT_APP_FORTMATIC_ID,
        });

        const infinityWallet = infinityWalletModule();
        const ledger = ledgerModule({
            walletConnectVersion: 2,
            projectId: process.env.REACT_APP_RPC_ONBOARD_ID,
        });
        const keystone = keystoneModule();
        const keepkey = keepkeyModule();
        const gnosis = gnosisModule();
        const enkrypt = enkryptModule();
        // const taho = tahoModule(); // Previously named Tally Ho wallet
        // const torusModule = torus();
        const trust = trustModule();
        const frontier = frontierModule();

        const portisKey = process.env?.REACT_APP_VITE_PORTIS_ID;
        const portis = portisKey ? portisModule({ apiKey: portisKey }) : null;

        const mewWalletModule = mewWallet();
        const injected = injectedModule({
            // filter: {
            //     [ProviderLabel.Detected]: ['desktop', 'mobile'],
            // },
            // displayUnavailable: [ProviderLabel.MetaMask, ProviderLabel.Trust],
            sort: (wallets) => {
                const metaMask = wallets.find(({ label }) => label === ProviderLabel.MetaMask);
                const coinbase = wallets.find(({ label }) => label === ProviderLabel.Coinbase);

                return (
                    [
                        metaMask,
                        coinbase,
                        ...wallets.filter(
                            ({ label }) => label !== ProviderLabel.MetaMask && label !== ProviderLabel.Coinbase
                        ),
                    ]
                        // remove undefined values
                        .filter((wallet) => wallet)
                );
            },
            /* walletUnavailableMessage: (wallet) =>
                `Oops ${wallet.label} is unavailable!` */
        });

        const trezorOptions = {
            email: "peri@pynths.com",
            appUrl: "https://dex.peri.finance",
        };

        const trezor = trezorModule(trezorOptions);

        const wallets: WalletInit[] = [
            injected,
            metamaskSDKWallet,
            walletConnect,
            coinbase,
            safe,
            trust,
            // torusModule,
            // dcent,
            enkrypt,
            // taho,
            frontier,
            fortmaticModule,
            infinityWallet,
            mewWalletModule,
            ledger,
            trezor,
            keepkey,
            gnosis,
            keystone,
            ...(portis ? [portis] : []),
        ];

        var supportedNetworks = process.env.REACT_APP_ENV === 'production' ? MAINNET : TESTNET;
        const chains: Chain[] = [];
        Object.keys(supportedNetworks).forEach((networkId) => {
            // console.log(networkId);
            chains.push({
                id: networkInfo[networkId].chainId,
                label: networkInfo[networkId].chainName,
                rpcUrl: networkInfo[networkId].rpcUrls,
            });
        });

        const appMetadata = {
            name: "PERI Finance DEX",
            icon: "/favicon.ico",
            description: "PERI Finance DEX",
            explore: "https://dex.peri.finance",
            recommendedInjectedWallets: [
                { name: "MetaMask", url: "https://metamask.io" },
                // { name: "Coinbase", url: "https://wallet.coinbase.com/" },
            ],
        };

        this.onboard = init({
            theme: colorMode as BuiltInThemes,
            wallets,
            chains,
            appMetadata,
            connect: {
                showSidebar: false,
                autoConnectLastWallet: autoConnect,
                autoConnectAllPreviousWallet: autoConnect,
                removeWhereIsMyWalletWarning: true,
            },
            accountCenter: { desktop: { enabled: true }, mobile: { enabled: false } },
        });

        // console.log("web3Onboard initialized");
    },
    _onWalletUpdated: (wallets: WalletState[]) => {
        const [primaryWallet] = wallets;

        web3Onboard.wallet(primaryWallet);
        const chainId = primaryWallet?.chains[0].id;
        const address = primaryWallet?.accounts[0].address;

        if (chainId !== web3Onboard.selectedNetwork) {
            // console.log(`walletUpdated-> chainId from ${web3Onboard.selectedNetwork} to ${chainId}`);
            web3Onboard.selectedNetwork = chainId;
            web3Onboard.network(chainId);
            web3Onboard.selectedAddress = address;
            web3Onboard.address(address);
        }

        if (web3Onboard.selectedAddress !== address) {
            // console.log(`walletUpdated->  address: ${address}`);
            web3Onboard.selectedAddress = address;
            web3Onboard.address(address);
        }

        if (!primaryWallet?.provider) {
            web3Onboard.unsubscribe.unsubscribe();
            web3Onboard.wallet(null);
            web3Onboard.selectedAddress = undefined;
            web3Onboard.selectedNetwork = undefined;
            console.log(`successfully unsubscribed`);
        }
    },
    // _onChainUpdated: (chains: Chain[]) => {
    //     const [chain] = chains;
    //     if (chain) {
    //         web3Onboard.network(Number(chain.id));
    //     } else {
    //         web3Onboard.network(0);
    //     }
    // },
    connect: async (walletLabel = undefined): Promise<void> => {
        try {
            if (!web3Onboard.wallet || !web3Onboard.address || !web3Onboard.network) return;

            const options = walletLabel ? { autoSelect: { label: walletLabel, disableModals: true } } : undefined;
            const [primaryWallet] = await web3Onboard.onboard.connectWallet(options);

            if (!primaryWallet?.provider) {
                web3Onboard.disconnect();
                return;
            }

            const wallets = web3Onboard.onboard.state.select("wallets");
            web3Onboard.unsubscribe = wallets.subscribe(web3Onboard._onWalletUpdated);
            web3Onboard._onWalletUpdated(web3Onboard.onboard.state?.get().wallets);

            console.log(`${primaryWallet.label} connected`);
            // label: primaryWallet.label;
            // address: primaryWallet.accounts[0].address;
            // chainId: primaryWallet.chains[0].id;
            return;
        } catch (e) {
            console.log("error:", e);
            NotificationManager.error(`connetion failed`, "", 2000);
        }

        return;
    },
    disconnect() {
        const [primaryWallet] = web3Onboard.onboard.state?.get().wallets;
        if (primaryWallet) {
            // primaryWallet.provider = null;
            web3Onboard.onboard.disconnectWallet({ label: primaryWallet.label });
            //
            // this.unsubscribe.unsubscribe();
            // this.selectedAddress = undefined;
            // this.selectedNetwork = undefined;

            console.log(`${primaryWallet.label} disconnected`);
        }
    },
};

// export const subscribeToWallet = (onWalletUpdated: (wallets: WalletState[]) => void) => {
//     const wallets = web3Onboard.onboard.state.select("wallets");
//     const { unsubscribe } = wallets.subscribe(onWalletUpdated);
//     return unsubscribe;
// };

// export const connect1 = async (
//     onWalletUpdated: (wallets: WalletState[]) => void,
//     walletLabel: any = undefined
// ) => {
//     try {
//         const options = walletLabel ? { autoSelect: { label: walletLabel, disableModals: true } } : undefined;
//         const [primaryWallet] = await web3Onboard.onboard.connectWallet(options);

//         if (!primaryWallet?.provider) {
//             onboardDisconnectWallet();
//             return null;
//         }

//         const provider = new ethers.providers.Web3Provider(primaryWallet.provider, "any");

//         web3Onboard.onboard.state.select("wallets");
//         const wallets = web3Onboard.onboard.state.select("wallets");
//         web3Onboard.unsubscribe = wallets.subscribe(onWalletUpdated);

//         console.log(`${primaryWallet.label} connected`);
//         return {
//             label: primaryWallet.label,
//             address: primaryWallet.accounts[0].address,
//             chainId: primaryWallet.chains[0].id,
//         };
//     } catch (e) {
//         console.log("error:", e);
//         NotificationManager.warning(`connetion failed`, "ERROR");
//     }

//     return null;
// };

// export const onboardDisconnectWallet = () => {
//     const [primaryWallet] = web3Onboard.onboard.state?.get().wallets;
//     if (primaryWallet) {
//         web3Onboard.onboard.disconnectWallet({ label: primaryWallet.label });
//         primaryWallet.provider = null;

//         console.log(`${primaryWallet.label} disconnected`);
//     }

// };
