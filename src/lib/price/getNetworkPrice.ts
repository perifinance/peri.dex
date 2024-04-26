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
		84532: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
		8453: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
		1284: "0x4497B606be93e773bbA5eaCFCb2ac5E2214220Eb",
		1285: "0x3f8BFbDc1e79777511c00Ad8591cef888C2113C1",
		1287: "0x3f8BFbDc1e79777511c00Ad8591cef888C2113C1",
		137: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
		80001: "0x001382149eBa3441043c1c66972b4772963f5D43",
		56: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
		97: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
		1: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
		1115511: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
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
