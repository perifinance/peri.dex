import { utils } from 'ethers'
export const formatCurrency = (value, decimals = 2) => {
	if(!value) return '0';
	const cutDecimals = Number(utils.formatEther(value)).toLocaleString('en', {maximumFractionDigits: decimals});
	return cutDecimals ? cutDecimals : value.toLocaleString();
};
