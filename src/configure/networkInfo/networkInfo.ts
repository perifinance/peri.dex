import { RPC_URLS } from "lib/rpcUrl";

// eslint-disable-next-line
export const networkInfo = {
	1: {
		chainId: "0x1",
		chainName: "Ethereum",
		rpcUrls: RPC_URLS[1],
		blockExplorerUrls: "https://etherscan.io",
	},
	5: {
		chainId: "0x5",
		chainName: "Goerli",
		rpcUrls: RPC_URLS[5],
		blockExplorerUrls: "https://goerli.etherscan.io",
	},
	56: {
		chainId: "0x38",
		chainName: "BSC",
		rpcUrls: RPC_URLS[56],
		blockExplorerUrls: "https://bscscan.com/",
	},
	1285: {
		chainId: "0x505",
		chainName: "Moonriver",
		// rpcUrls: "https://moonriver.api.onfinality.io/rpc?apikey=96fac326-b64d-4479-8b8d-2bcf64d0f99f",
		rpcUrls: RPC_URLS[1285],
		blockExplorerUrls: "https://blockscout.moonriver.moonbeam.network/",
	},
	97: {
		chainId: "0x61",
		chainName: "BSCTest",
		rpcUrls: RPC_URLS[97],
		blockExplorerUrls: "https://testnet.bscscan.com",
	},
	137: {
		chainId: "0x89",
		chainName: "Polygon",
		rrpcUrls: RPC_URLS[137],
		blockExplorerUrls: "https://explorer.matic.network/",
	},
	1287: {
		chainId: "0x507",
		chainName: "Moonbase",
		rpcUrls: RPC_URLS[1287],
		blockExplorerUrls: "https://moonbase-blockscout.testnet.moonbeam.network/",
	},
	80001: {
		chainId: "0x13881",
		chainName: "Mumbai",
		rpcUrls: RPC_URLS[80001],
		blockExplorerUrls: "https://mumbai.polygonscan.com/",
	},
};
