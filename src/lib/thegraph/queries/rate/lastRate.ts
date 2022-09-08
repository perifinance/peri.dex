import { ethers } from "ethers";
import { contracts } from "lib/contract";

export const lastRate = async (currencyName = undefined) => {
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
		pBTC: "0x1B5C6cF9Df1CBF30387C24CC7DB1787CCf65C797",
		pETH: "0xc3cF399566220dc5Ed6C8CFbf8247214Af103C72",
		pBNB: "0xD6B013A65C22C372F995864CcdAE202D0194f9bf",
		pAVAX: "0x992F9B8Aa09B8e084acf4e3213d8b2da5D366D6a",
		pUNI: "0x05Ec3Fb5B7CB3bE9D7150FBA1Fb0749407e5Aa8a",
		pMKR: "0xD8542f327FaD60b80D8C19025147E6b9d857bb99",
		pCAKE: "0xc44ecD8C11fd1F281A3d6044CA65e649484B228c",
		pAAVE: "0x37f35ef6735c594e6E803bC81577bAC759d8179C",
		pCOMP: "0x29710821d57a1Fc46E2D9FdDE65Df2cF205bad2A",
		pSUSHI: "0x28A9E2747a10eE94D2d7359DEB60023D19FfdD96",
		pSNX: "0x26E3F9273abC8a01228bE97a106E60FA38b98df2",
		pCRV: "0x03d44d68EdF41c540A90C6eB2BE27C4a75ee689f",
		pYFI: "0xE3324ea60FA272BBB4511dDBD4776feFE4674fa0",
		p1INCH: "0x1466b4bD0C4B6B8e1164991909961e0EE6a66d8c",
		pANKR: "0x94Ee35E8b9B1b4Cd3BDB720242d6d1796b43C2Ff",
		pLINK: "0xdD27789b504fEd690F406A82F16B45a0901172C0",
		pDOT: "0x54B584eb643375C41c55ddD8Da4b90124b18d05c",
		pXRP: "0x3FD363679fb59596d45881bbfBe4bb864f3545A2",
		pAXS: "0x9322CeAd48BA0C76Fecc78e82499ce8a829Eab89",
		pEUR: "0xe6Ccbe1Cb33dF799a59E37a1382c7009dbaBE9ff",
		pSAND: "0x5403385DF6eb607fc1fA6983eF5801A11eC7fD9a",
		pMANA: "0x424807fA7B16f747CbD30963fAe25fB8Db0b97bF",
	};

	if (currencyName === "pUSD") {
		return 1n * 10n ** 18n;
	}

	if (address[currencyName]) {
		try {
			const contract = new ethers.Contract(
				address[currencyName],
				aggregatorV3InterfaceABI,
				contracts.provider
			);
			const lastRound = await contract.latestRoundData();

			return BigInt(lastRound.answer) * 10n ** 10n;
		} catch (e) {
			return 0n;
		}
	}

	return 10n ** 18n;
};
