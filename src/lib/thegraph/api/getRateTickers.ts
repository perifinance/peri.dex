import { pynthsList } from "configure/coins/pynthsList";

import { chartRates } from "../queries";
import { get } from "../service";

// Todo: pMATIC, pCAKE price is not available
export const getRateTickers = async () => {
	const promise = [];
	let searchDate = Number((new Date().getTime() / 1000).toFixed(0)) - 60 * 60 * 24;
	const data = {};

	const setData = async (currencyName) => {
		let datas = await get(chartRates({ currencyName, searchDate }));
		// console.log(datas);
		if (datas.length > 0) {
			try {
				const timestamp = Number(datas[datas.length - 1].timestamp);
				const lastPrice = BigInt(datas[datas.length - 1].price) * 10n**10n;
				const firstPrice = BigInt(datas[0].price) * 10n**10n;
				const change = (lastPrice - firstPrice) * 10n**18n / lastPrice * 100n;
				data[currencyName] = {timestamp, price: lastPrice, change}; 
				return;
			} catch (error) {
				console.log(error);
			}
		} else if (currencyName === "pUSD") {
			data[currencyName] = {timestamp:0n, price: 10n**18n, change:0n};
			return;
		}

		data[currencyName] = {timestamp:0n, price: 0n, change:0n}; 
		datas = null;
	};

	// console.log("pynthsList", pynthsList);

	pynthsList.forEach((pynth) => {
		promise.push(setData(pynth.symbol));
	});

	searchDate = null;

	return Promise.all(promise).then(() => data);
};
