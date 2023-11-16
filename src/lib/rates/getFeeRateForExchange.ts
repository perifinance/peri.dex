import { contracts } from "../contract";
import { utils } from "ethers";

export const getFeeRateForExchange = async (sourceSymbol, destinationSymbol) => {
	const { Exchanger } = contracts as any;

	// console.log(utils.formatBytes32String(sourceSymbol),utils.formatBytes32String(destinationSymbol));
	let fee = BigInt(0);
	try {
		fee = BigInt(
			await Exchanger.feeRateForExchange(
				utils.formatBytes32String(sourceSymbol),
				utils.formatBytes32String(destinationSymbol)
			)
		);
	} catch (e) {
		console.error("getFeeRateForExchange ERROR:", e);
	}

	return fee;
};
