
export const getGasPrice = async (networkId):Promise<string> => {
    try {
        const gasPrice = await estimateGasPice(networkId, "standard");
        return gasPrice;
    } catch (e) {
		switch (networkId) {
			case 1285:
				return '130';
			case 137:
				return '130';
			case 8453:
				return '0.1';
			default:
				return '1';
		}
    }
}

export const testGasPrice = async (networkId):Promise<string> => {
	switch (networkId) {
		case 97:
			return '3';
		case 84532:
			return '0.0003';
		default:
			return '1';
	}
}

const estimateGasPice = async (network, priority) => {
	console.log(process.env.REACT_APP_INFURA_API_KEY + ':' + process.env.REACT_APP_INFURA_API_SECRET_KEY);
	const Auth = Buffer.from(
		process.env.REACT_APP_INFURA_API_KEY + ':' + process.env.REACT_APP_INFURA_API_SECRET_KEY
	).toString('base64');

	const gasStationUrl = `https://gas.api.infura.io/networks/${network}/suggestedGasFees`;

	const { high, medium, low } = await fetch(gasStationUrl, {
			headers: { 
				'Content-Type': 'application/json',
				Authorization: `Basic ${Auth}`,
			},
		}).then(response => response.json());

		// console.log("medium", medium);
	var gasPrice = 0;
	switch (priority) {
		case 'fast':
			gasPrice =
				Number(high.suggestedMaxFeePerGas) + Number(high.suggestedMaxPriorityFeePerGas);
			break;
		case 'standard':
			gasPrice =
			Number(medium.suggestedMaxFeePerGas) + Number(medium.suggestedMaxPriorityFeePerGas);
			break;
		default:
			gasPrice =
			Number(low.suggestedMaxFeePerGas) + Number(low.suggestedMaxPriorityFeePerGas);
	}
	// console.log("gasPrice", gasPrice);
	return gasPrice.toString();
}