import { pynthsList } from "configure/coins/pynthsList";

const chartRates = async (symbol:string, resulution:string, from:number, to:number) => {
	const pythHistoryUrl =  "https://benchmarks.pyth.network/v1/shims/tradingview/history/?symbol=" + symbol + "&resolution=" + resulution + "&from=" + from + "&to=" + to;

	const response = await fetch(pythHistoryUrl);

	const data = await response.json();
	return data.s !== "ok" ? data : [];
};

export const getPreCloses = async (symbol:string) => {
	const now = Math.ceil(new Date().getTime() / 1000);
	const start = now - 60 * 60 * 24;
	const end = start + 60 * 2;

	try {
		let datas = await chartRates(symbol, '1', start, end);

		if (datas.length > 0) {
			const timestamp = Number(datas.t[0]);
			const firstOpen = BigInt(datas.o[0]) * 10n**10n;
			return {timestamp, preClose: firstOpen}; 
		} else if (symbol === "pUSD") {
			return {timestamp:0n, preClose: 10n**18n};
		}
	} catch (error) {
		console.log(error);
	}

	return {timestamp:0n, preClose: 0n}; 
};

export const getSymbolTicker = async (symbol:string) => {
	const now = Math.ceil(new Date().getTime() / 1000);
	const start = now - 60 * 60 * 24;

	try {
		let datas = await chartRates(symbol, '1', start, now);
		// console.log(datas);
		if (datas.length > 0) {
			const timestamp = Number(datas.t[datas.length - 1]);
			const lastPrice = BigInt(datas.c[datas.length - 1]) * 10n**10n;
			const firstPrice = BigInt(datas.o[0]) * 10n**10n;
			const change = lastPrice > 0n ? (lastPrice - firstPrice) * 10n**18n / lastPrice * 100n : 0n;
			return {timestamp, price: lastPrice, change}; 
		} else if (symbol === "pUSD") {
			return {timestamp:0n, price: 10n**18n, change:0n};
		}
	} catch (error) {
		console.log(error);
	}

	return {timestamp:0n, price: 0n, change:0n}; 
};

export const getSymbolTickers = async () => {
	const promise = [];
	const data = {};

	pynthsList.forEach((pynth) => {
		promise.push(getSymbolTicker(pynth.symbol));
	});

	return Promise.all(promise).then((res) => {
		res.forEach((e, idx) => {
			data[pynthsList[idx].symbol] = e;
		});
		return data;
	});
};