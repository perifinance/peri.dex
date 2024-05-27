import { pynthsList } from "configure/coins/pynthsList";

import { chartRates } from "../queries";
import { get } from "../service";
import { toNumber } from "lib/bigInt";

export type RatePreCloseType = {
	timestamp: number;
	preClose: number;
};

export type RateTickerType = {
	timestamp: number;
	price: number;
	change: number;
	high: number;
	low: number;
	preClose: number;
};
export const getRatePreCloses = async (symbol:string) => {
	const now = Math.ceil(new Date().getTime() / 1000);
	const start = now - 60 * 60 * 24;

	try {
		const datas = await get(chartRates({ currencyName:symbol, searchDate:start }));

		if (datas.length > 0) {
			const timestamp = Number(datas[0].timestamp) / 10**8;
			const firstOpen = toNumber(BigInt(datas[0].price) * 10n**10n);
			return {timestamp, preClose: firstOpen}; 
		} else if (symbol === "pUSD") {
			return { timestamp: 0, preClose: 1 } as RatePreCloseType;
		}
	} catch (error) {
		console.log(error);
	}

	return {timestamp:0, preClose: 0} as RatePreCloseType; 
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
				const lastPrice = toNumber(BigInt(datas[datas.length - 1].price) * 10n**10n);
				const firstPrice = toNumber(BigInt(datas[0].price) * 10n**10n);
				// console.log(currencyName, {timestamp, price: lastPrice, preClose: firstPrice});
				const change = lastPrice > 0 ? (lastPrice - firstPrice) / lastPrice * 100 : 0;
				const high = datas.reduce((prev, curr) => {
					const bnHigh = prev;/* typeof prev == "number" 
						? BigInt(prev) * 10n**10n 
						: prev;*/
					const bnCurr = toNumber(BigInt(curr.price) * 10n**10n);
					return bnHigh > bnCurr ? bnHigh : bnCurr;
				});
				const low = datas.reduce((prev, curr) => {
					const bnLow = prev;/* typeof prev == "number" 
						? BigInt(prev) * 10n**10n 
						: prev; */
					const bnCurr = toNumber(BigInt(curr.price) * 10n**10n);
					return bnLow < bnCurr ? bnLow : bnCurr;
				});
				// console.log(currencyName, {timestamp, price: lastPrice, change, high, low, preClose: firstPrice});
				data[currencyName] = {timestamp, price: lastPrice, change, high, low, preClose: firstPrice} as RateTickerType;
				return;
			} catch (error) {
				console.log(error);
			}
		} else if (currencyName === "pUSD") {
			data[currencyName] = {timestamp:0, price: 1, high: 1, low: 1,change:0, preClose:1};
			return;
		}

		data[currencyName] = {timestamp:0, price: 0, high: 0, low: 0, change:0, preClose:0}; 
		datas = null;
	};

	// console.log("pynthsList", pynthsList);

	pynthsList.forEach((pynth) => {
		promise.push(setData(pynth.symbol));
	});

	searchDate = null;

	return Promise.all(promise).then(() => data);
};
