export const SUPPORTED_NETWORKS = {
	1: 'MAINNET',
	// 3: 'ROPSTEN',
	// 4: 'RINKEBY',
	5: 'GOERLI',
	11155111: 'SEPOLIA',
	56: 'BSC',
	1284: 'MOONBEAM',
	1285: 'MOONRIVER',
	137: 'POLYGON',
	97: 'BSCTEST',
	1287: 'MOONBASE-ALPHANET',
	80001: 'MUMBAI',
	8453: 'BASE',
	84532: 'BASE-SEPOLIA',
};

export const MAINNET = {
	1: 'MAINNET',
	56: 'BSC',
	1284: 'MOONBEAM',
	1285: 'MOONRIVER',
	137: 'POLYGON',
	8453: 'BASE',
};

export const TESTNET = {
	11155111: 'SEPOLIA',
	97: 'BSCTEST',
	1287: 'moonbase-alphanet',
	80001: 'MUMBAI',
	84532: 'BASE-SEPOLIA'
};

export const DEXNET = {
	1284: 'MOONBEAM',
	1285: 'MOONRIVER',
	1287: 'moonbase-alphanet',
	137: 'POLYGON',
	80001: 'MUMBAI',
	56: 'BSC',
	97: 'BSCTEST',
	8453: 'BASE',
	84532: 'BASE-SEPOLIA'
};

export const UNPOPULARNET = {
	1285: 'MOONRIVER',
	1287: 'moonbase-alphanet',
};

export const FEEDNETID = 137;

export const isExchageNetwork = (networkId) => {
	return Object.keys(DEXNET).find(key => Number(key) === networkId) !== undefined;
}