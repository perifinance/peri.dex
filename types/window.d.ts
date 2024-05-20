import { ethers } from 'ethers';
type EthereumProvider = {
	on: (event: string, cb: () => void) => void;
	isConnected: () => boolean;
	ethereum: ethers.providers.Provider | undefined;
	isMetaMask: boolean;
	netWorkVersion: string;
	request: (event: string, cb: () => void) => void;
}

declare global {
	interface Window {
		Browser: any;
		location: Location;
		ethereum?: EthereumProvider;
	}
}
