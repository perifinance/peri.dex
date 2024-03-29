// eslint-disable-next-line
export default {
	1: {
		chainId: "0x1",
		chainName: "Ethereum Mainnet",
		rpcUrls: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
		blockExplorerUrls: "https://etherscan.io",
	},
	42: {
		chainId: "0x2a",
		chainName: "Kovan TestNet",
		rpcUrls: "https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
		blockExplorerUrls: "https://kovan.etherscan.io",
	},
	56: {
		chainId: "0x38",
		chainName: "Binance Smart Chain Mainnet",
		rpcUrls: "https://bsc-dataseed1.defibit.io",
		blockExplorerUrls: "https://bscscan.com/",
	},
	1285: {
		chainId: "0x505",
		chainName: "moonriver",
		// rpcUrls: "https://moonriver.api.onfinality.io/rpc?apikey=96fac326-b64d-4479-8b8d-2bcf64d0f99f",
		rpcUrls: false
			? `https://moonriver.blastapi.io/fe1ee7ca-fcf8-4db2-9cd7-7246cded8a03`
			: `https://moonriver.public.blastapi.io`,
		blockExplorerUrls: "https://blockscout.moonriver.moonbeam.network/",
	},
	97: {
		chainId: "0x61",
		chainName: "Binance Smart Chain testnet",
		rpcUrls: "https://data-seed-prebsc-1-s1.binance.org:8545/",
		blockExplorerUrls: "https://testnet.bscscan.com",
	},
	137: {
		chainId: "0x89",
		chainName: "Polygon Mainnet",
		rpcUrls: "https://rpc-mainnet.maticvigil.com",
		blockExplorerUrls: "https://explorer.matic.network/",
	},
	1287: {
		chainId: "0x507",
		chainName: "moonbase-alphanet",
		rpcUrls: "https://rpc.testnet.moonbeam.network",
		blockExplorerUrls: "https://moonbase-blockscout.testnet.moonbeam.network/",
	},
	80001: {
		chainId: "0x13881",
		chainName: "Mumbai TestNet",
		rpcUrls: "https://rpc-mumbai.maticvigil.com",
		blockExplorerUrls: "https://mumbai.polygonscan.com/",
	},
};
