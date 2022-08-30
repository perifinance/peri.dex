// import { add } from 'date-fns';
import { ethers } from "ethers";
import { contracts } from "lib/contract";

export const getNetworkPrice = async (networkId) => {
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

	const address = {
		1285: "0x3f8BFbDc1e79777511c00Ad8591cef888C2113C1",
	};
	if (address[networkId]) {
		try {
			const contract = new ethers.Contract(
				address[networkId],
				aggregatorV3InterfaceABI,
				contracts.provider
			);
			const lastRound = await contract.latestRoundData();

			return BigInt(lastRound.answer) * 10n ** 10n;
		} catch (e) {
			return 0n;
		}
	} else {
	}

	return 0n;
};
