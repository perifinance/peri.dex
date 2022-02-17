export const SUPPORTED_NETWORKS = process.env.REACT_APP_ENV === 'development' ? {
	42: 'KOVAN',
	97: 'BSCTEST',
	1287: 'moonbase-alphanet',
	80001: 'MUMBAI',
} : {
	1: 'MAINNET',
	56: 'BSC',
	137: 'POLYGON',
	1285: 'MOONRIVER'
};
