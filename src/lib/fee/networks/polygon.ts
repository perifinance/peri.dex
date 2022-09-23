export const polygon = async () => {
	try {
		const getNetworkInfo = await fetch(`https://gasstation-mainnet.matic.network`).then((response) => response.json());
		// console.log("polygon gas price", getNetworkInfo.standard);
		return BigInt(Math.floor(getNetworkInfo.standard));
	} catch (e) {
		console.error(e);
		return BigInt(25);
	}
};
