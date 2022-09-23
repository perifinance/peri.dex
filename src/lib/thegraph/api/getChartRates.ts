import { chartRate } from "../queries";
import { get } from "../service";
import { format } from "date-fns";
import { utils } from "ethers";
import { formatCurrency } from "lib";

type ChartRateParameter = {
	currencyNames: {
		source: String;
		destination: String;
	};
	page?: number;
	first?: number;
	chartTime?: String;
	loadingHandler?: any;
};
export const getChartRates = async ({
	currencyNames,
	page = undefined,
	first = undefined,
	chartTime = "24H",
	loadingHandler,
}: ChartRateParameter) => {
	await loadingHandler(true);
	let searchDate;

	switch (chartTime) {
		case "24H":
			searchDate = Number((new Date().getTime() / 1000).toFixed(0)) - 60 * 60 * 24;
			break;
		case "3D":
			searchDate = Number((new Date().getTime() / 1000).toFixed(0)) - 60 * 60 * 24 * 3;
			break;
		case "1W":
			searchDate = Number((new Date().getTime() / 1000).toFixed(0)) - 60 * 60 * 24 * 7;
			break;
		case "1M":
			searchDate = Number((new Date().getTime() / 1000).toFixed(0)) - 60 * 60 * 24 * 30;
			break;
		default:
			searchDate = 0;
			break;
	}

	const pUSDPrice = {
		low: (10n ** 18n).toString(),
		price: (10n ** 18n).toString(),
		high: (10n ** 18n).toString(),
		timestamp: new Date(),
	};

	let sourceData =
		currencyNames.source === "pUSD"
			? [{ ...pUSDPrice, itemstamp: searchDate }, pUSDPrice]
			: await get(chartRate({ currencyName: currencyNames.source, page, first, searchDate }));

	if (currencyNames.source !== "pUSD" && sourceData.length <= 1) {
		sourceData = await get(chartRate({ currencyName: currencyNames.source, page: 0, first: 2 }));
	}

	let destinationData =
		currencyNames.destination === "pUSD"
			? [{ ...pUSDPrice, itemstamp: searchDate }, pUSDPrice]
			: await get(chartRate({ currencyName: currencyNames.destination, page, first, searchDate }));

	if (currencyNames.destination !== "pUSD" && destinationData.length <= 1) {
		destinationData = await get(chartRate({ currencyName: currencyNames.destination, page: 0, first: 2 }));
	}

	let dayFlag;
	let values = [];
	let low = BigInt(1000000000000000000000000000000000);
	let high = BigInt(0);
	const datas = currencyNames.source === "pUSD" ? destinationData : sourceData;

	try {
		datas.forEach((item, index) => {
			const destinationDataItem = destinationData[index] ? destinationData[index] : destinationData[destinationData.length - 1];
			const sourceDataItem = sourceData[index] ? sourceData[index] : sourceData[sourceData.length - 1];
			dayFlag = new Date(item.timestamp * 1000);

			let price = BigInt(0);

			if (currencyNames.source === "pUSD" || currencyNames.destination === "pUSD") {
				price = ((BigInt(destinationDataItem.price) * 10n ** 18n) / BigInt(sourceDataItem.price)) * 10n ** 10n;
				high = price > high ? price : high;
				low = price < low ? price : low;
			} else {
				price = (BigInt(destinationDataItem.price) * 10n ** 18n) / BigInt(sourceDataItem.price);
				high = price > high ? price : high;
				low = price < low ? price : low;
			}

			values.push({ low, price, high, timestamp: dayFlag });
		});
	} catch (e) {
		console.error("getChartRates Error:", e);
	}

	await loadingHandler(false);

	return values.map((e) => {
		return {
			price: utils.formatEther(e.price),
			low: utils.formatEther(e.low),
			high: utils.formatEther(e.high),
			formatPrice: formatCurrency(e.price, 8),
			formatLow: formatCurrency(e.low, 8),
			formatHigh: formatCurrency(e.high, 8),
			timestamp: e.timestamp / 1000,
			time: format(e.timestamp, "MM/dd HH:mm"),
		};
	});
};
