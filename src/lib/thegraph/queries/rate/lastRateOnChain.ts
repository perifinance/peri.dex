import { ethers } from "ethers";
import { contracts } from "lib/contract";
import pynths from "configure/coins/pynths";

export const lastRateOnChain = async (networkId, currencyName = undefined) => {
	const aggregatorV3InterfaceABI = [
		{
			inputs: [],
			name: "decimals",
			outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
			stateMutability: "view",
			type: "function",
		},
		{
			inputs: [],
			name: "description",
			outputs: [{ internalType: "string", name: "", type: "string" }],
			stateMutability: "view",
			type: "function",
		},
		{
			inputs: [{ internalType: "uint80", name: "_roundId", type: "uint80" }],
			name: "getRoundData",
			outputs: [
				{ internalType: "uint80", name: "roundId", type: "uint80" },
				{ internalType: "int256", name: "answer", type: "int256" },
				{ internalType: "uint256", name: "startedAt", type: "uint256" },
				{ internalType: "uint256", name: "updatedAt", type: "uint256" },
				{ internalType: "uint80", name: "answeredInRound", type: "uint80" },
			],
			stateMutability: "view",
			type: "function",
		},
		{
			inputs: [],
			name: "latestRoundData",
			outputs: [
				{ internalType: "uint80", name: "roundId", type: "uint80" },
				{ internalType: "int256", name: "answer", type: "int256" },
				{ internalType: "uint256", name: "startedAt", type: "uint256" },
				{ internalType: "uint256", name: "updatedAt", type: "uint256" },
				{ internalType: "uint80", name: "answeredInRound", type: "uint80" },
			],
			stateMutability: "view",
			type: "function",
		},
		{
			inputs: [],
			name: "version",
			outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
			stateMutability: "view",
			type: "function",
		},
	];

	if (currencyName === "pUSD") {
		return 1n * 10n ** 18n;
	}

	const pynth = pynths[networkId].find((p) => p.symbol === currencyName);
	// console.log("lastRate", networkId, currencyName, pynthAddress, contracts.provider);
	if (pynth.priceFeedContract && contracts.provider) {
		try {
			const contract = new ethers.Contract(
				pynth.priceFeedContract,
				aggregatorV3InterfaceABI,
				contracts.provider
			);
			const lastRound = await contract.latestRoundData();

			return BigInt(lastRound.answer) * 10n ** 10n;
		} catch (e) {
			console.error("lastRate error", e);
			return 0n;
		}
	}

	return 10n ** 18n;
};
