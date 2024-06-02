import { networkInfo } from "configure/networkInfo";
import { NotificationManager } from "react-notifications";
// import { web3Onboard } from "lib/onboard";
import { providers } from "ethers";

export const changeNetwork = async (chainId:any, wallet) => {
    let web3Provider = null;
    try {
        if (isNaN(chainId) || chainId == null || wallet === undefined || wallet === null) return;

        web3Provider = new providers.Web3Provider(wallet.provider, "any");
        // @ts-ignore
        await (web3Provider.provider as any)?.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: networkInfo[chainId].chainId }],
        });
    } catch (switchError) {
        
        console.log(switchError);
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === -32002) {
            NotificationManager.warning("Please add the network to your wallet.");
        }
        // handle other "switch" errors
    }

    web3Provider = null;
};
