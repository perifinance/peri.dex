import { utils } from 'ethers'
export const formatCurrency = (value, decimals = 2) => {
	if(!value) return '0';
	const regexp = new RegExp(`(\\d+\\.)+\\d{0,${decimals}}`, 'g');
	const cutDecimals = Number(utils.formatEther(value)).toLocaleString('en', {maximumFractionDigits: decimals});
	return cutDecimals ? cutDecimals : value.toLocaleString();
};
