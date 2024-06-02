import { extractMessage } from "lib/error";
import { SUPPORTED_NETWORKS } from "lib/network";

export const getBridgeCost = async (networkId:number|string, contracts ):Promise<any> => {
	const network = SUPPORTED_NETWORKS[networkId]?.toLowerCase();
	if (!network && !contracts?.SystemSettings) return null;
	try {
        const contract = contracts.SystemSettings;
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