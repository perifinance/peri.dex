import { pynthsList } from "configure/coins/pynthsList";

import { chartRates } from "../queries";
import { get } from "../service";


export const getRatePreCloses = async (symbol:string) => {
	const now = Math.ceil(new Date().getTime() / 1000);
	const start = now - 60 * 60 * 24;

	try {
		const datas = await get(chartRates({ currencyName:symbol, searchDate:start }));

		if (datas.length > 0) {
			const timestamp = Number(datas[0].timestamp);
			const firstOpen = BigInt(datas[0].price) * 10n**10n;
			return {timestamp, preClose: firstOpen}; 
		} else if (symbol === "pUSD") {
			return {timestamp:0, preClose: 10n**18n};
		}
	} catch (error) {
		console.log(error);
	}

	return {timestamp:0, preClose: 0n}; 
};

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
				const change = lastPrice > 0n ? (lastPrice - firstPrice) * 10n**18n / lastPrice * 100n : 0n;
				data[currencyName] = {timestamp, price: lastPrice, change, preClose: firstPrice}; 
				return;
			} catch (error) {
				console.log(error);
			}
		} else if (currencyName === "pUSD") {
			data[currencyName] = {timestamp:0n, price: 10n**18n, change:0n, preClose:10n**18n};
			return;
		}

		data[currencyName] = {timestamp:0n, price: 0n, change:0n, preClose:0n}; 
		datas = null;
	};

	// console.log("pynthsList", pynthsList);

	pynthsList.forEach((pynth) => {
		promise.push(setData(pynth.symbol));
	});

	searchDate = null;

	return Promise.all(promise).then(() => data);
};
