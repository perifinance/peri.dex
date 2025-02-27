export const INFURA_ID: string = process.env.REACT_APP_INFURA_API_KEY;

export const RPC_URLS: object = {
	1: `https://mainnet.infura.io/v3/${INFURA_ID}`,
	3: `https://ropsten.infura.io/v3/${INFURA_ID}`,
	4: `https://rinkeby.infura.io/v3/${INFURA_ID}`,
	5: `https://goerli.infura.io/v3/${INFURA_ID}`,
	42: `https://kovan.infura.io/v3/${INFURA_ID}`,
	56: "https://bsc-dataseed2.binance.org",
	97: "https://data-seed-prebsc-1-s1.binance.org:8545/",
	137: "https://polygon-bor-rpc.publicnode.com",
	// 137: `https://rpc-mainnet.maticvigil.com/v1/${process.env.REACT_APP_RPC_MATIC_ID}`,
	// 1285: `https://moonriver.api.onfinality.io/rpc?apikey=96fac326-b64d-4479-8b8d-2bcf64d0f99f`,
	1284: `https://moonbeam-rpc.publicnode.com`,
	1285: /* false ?  `https://moonriver.blastapi.io/fe1ee7ca-fcf8-4db2-9cd7-7246cded8a03`, */ `https://moonriver.public.blastapi.io`,
	1287: /* false ? */`https://rpc.api.moonbase.moonbeam.network`, /* : `https://rpc.testnet.moonbeam.network`, */ //`https://moonbeam-alpha.api.onfinality.io/public`,
	8453: 'https://base-rpc.publicnode.com',
	80001: 'https://polygon-mumbai-bor-rpc.publicnode.com',
	84532: 'https://base-sepolia-rpc.publicnode.com',
	11155111: 'https://ethereum-sepolia-rpc.publicnode.com',
};