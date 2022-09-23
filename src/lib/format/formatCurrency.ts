import { utils } from "ethers";
export const formatCurrency = (value, decimals = 2) => {
	if (!value) return "0";

	const cutValue = 10n ** BigInt(18 - decimals);
	const cutDecimals = (value / cutValue) * cutValue;
	const addComma =
		utils.formatEther(cutDecimals).split(".")[1][1] === "0"
			? Number(utils.formatEther(cutDecimals)).toLocaleString("en", {
					maximumFractionDigits: decimals,
			  })
			: Number(utils.formatEther(cutDecimals)).toLocaleString("en", {
					maximumFractionDigits: 2,
			  });

	return addComma ? addComma : cutDecimals.toLocaleString();
};
