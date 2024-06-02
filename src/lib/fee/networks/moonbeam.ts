import axios from "axios";

export const moonriver = async (networkId):Promise<string> => {
    const gasPrice = await estimateGasPice(networkId, 'standard');

	return gasPrice;
}

export const moonbeam = async (networkId):Promise<string> => {
    const gasPrice = await estimateGasPice(networkId, 'standard');

	return gasPrice;
}

export const moonbase = async (networkId):Promise<string> => {
	return '1';
}

const estimateGasPice = async (network, priority):Promise<string> => {
	const gasStationUrl = `https://${network===1284 ? 'gmbeam':'gmriver'}.blockscan.com/gasapi.ashx`;
	console.log(`requesting gas price for ${network} : ${gasStationUrl}`);

	return axios
		.get(gasStationUrl, {
			params: { apiKey: 'key', method: 'gasoracle' },
		})
		.then(({ data }) => {
			const { SafeGasPrice, ProposeGasPrice, FastGasPrice } = data.result;

			switch (priority) {
				case 'fastest':
					return FastGasPrice;
				case 'fast':
					return FastGasPrice;
				case 'standard':
					return ProposeGasPrice;
				default:
					return SafeGasPrice;
			}
		})
		.catch(e => {
			// console.log(e)
			if (network === 1284) return '130';
			else return '1';
		});
}