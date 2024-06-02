import { contracts } from "lib/contract";

export const getBalance = async (address: string, coinName: string, decimal) => {
	if (!contracts.chainId) return 0n;

	try {
		if (decimal === 18) {
			return BigInt((await contracts[`ProxyERC20${coinName}`].balanceOf(address)).toString());
		} else {
			return (
				BigInt((await contracts[`ProxyERC20${coinName}`].balanceOf(address)).toString()) *
				BigInt(Math.pow(10, 18 - decimal).toString())
			);
		}
	} catch (e) {
		console.error("getBalance ERROR:", e);
	}
	return 0n;
};

