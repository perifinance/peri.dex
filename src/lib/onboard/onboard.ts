import type { WalletInit } from "@web3-onboard/common";
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
import { Chain } from "@web3-onboard/common/dist/types";
import ledgerModule from "@web3-onboard/ledger";
import metamaskSDK from "@web3-onboard/metamask";
// import { init } from '@web3-onboard/react'
import { networkInfo } from "configure/networkInfo";
import { MAINNET, TESTNET } from "lib/network/supportedNetWorks";
import init from "@web3-onboard/core";

export const initOnboard = (colorMode = "light", autoConnect = false)  => {

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
		icon: "favicon.ico",
		description: "PERI Finance DEX",
		explore: "https://dex.peri.finance",
		/* recommendedInjectedWallets: [
			{ name: "MetaMask", url: "https://metamask.io" },
			{ name: "Coinbase", url: "https://wallet.coinbase.com/" },
		], */
	};


	return init({
		theme: colorMode as "light" | "dark",
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
};



// // Initialize onboard
// const onboard = init(getInitOptions("dark", false));

// // Create a context to provide onboard
// const OnboardContext = createContext(onboard);

// // Custom hook to use onboard
// export function useOnboard() {
// 	return useContext(OnboardContext);
// }