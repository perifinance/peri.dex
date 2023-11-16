export const polygon = async () => {
	try {
		const getNetworkInfo = await fetch(`https://gasstation.polygon.technology/v2`).then((response) => response.json());
		// console.log("polygon gas price", getNetworkInfo.standard.maxFee);
		return BigInt(Math.floor(getNetworkInfo.standard.maxFee));
	} catch (e) {
		console.error(e);
		return BigInt(25);
	}
};
