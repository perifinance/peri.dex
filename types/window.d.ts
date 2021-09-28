import { ethers } from 'ethers';
import { utils } from 'ethers';
type EthereumProvider = {
	on: (event: string, cb: () => void) => void;
	isConnected: () => boolean;
	ethereum: ethers.providers.Provider | undefined;
	isMetaMask: boolean;
	netWorkVersion: string;
}

declare global {
    interface Window {
		utils: utils;
        ethereum?: EthereumProvider;
    }
}