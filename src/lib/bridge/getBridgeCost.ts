import perifinance from "@perifinance/peri-finance";
import { ethers, providers } from "ethers";
import { extractMessage } from "lib/error";
import { SUPPORTED_NETWORKS } from "lib/network";
import { RPC_URLS } from "lib/rpcUrl";

export const getBridgeCost = async (networkId:number|string ):Promise<any> => {
	const network = SUPPORTED_NETWORKS[networkId]?.toLowerCase();
	if (!network) return null;
	try {
		const sources = perifinance.getSource({ network })[
			"SystemSettings"
		];
		const provider = new providers.JsonRpcProvider(RPC_URLS[networkId], networkId);
        const address = perifinance.getTarget({ network })[
            "SystemSettings"
        ].address;
        const contract = new ethers.Contract(address, sources.abi, provider);
		const [submitCost, claimCost] = await Promise.all([
			contract?.bridgeTransferGasCost(),
			contract?.bridgeClaimGasCost()
		]);

		return {
			0: submitCost, 
            2: claimCost
		};
		
	} catch (e) {
		console.log(extractMessage(e));
		// NotificationManager.warning("No pUSD is available to exchange in your wallet.");
	}
	return null;
}