export const INFURA_ID: string = process.env.REACT_APP_INFURA_ID;

export const RPC_URLS: object = {
	1: `https://mainnet.infura.io/v3/${INFURA_ID}`, 
	3: `https://ropsten.infura.io/v3/${INFURA_ID}`,
	4: `https://rinkeby.infura.io/v3/${INFURA_ID}`,
	5: `https://goerli.infura.io/v3/${INFURA_ID}`,
	42: `https://kovan.infura.io/v3/${INFURA_ID}`,
	56: 'https://bsc-dataseed1.binance.org',
	97: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
	137: `https://rpc-mainnet.maticvigil.com/v1/${process.env.REACT_APP_RPC_MATIC_ID}`,
	80001:`https://rpc-mumbai.maticvigil.com/v1/${process.env.REACT_APP_RPC_MUMBAI_ID}`
}
