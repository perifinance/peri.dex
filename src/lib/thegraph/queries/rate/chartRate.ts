import { gql } from "@apollo/client";
import { utils } from "ethers";

export const chartRate = ({ currencyName, page = 0, first = 1000, searchDate = 0 }) => {
	// const currencyKey = currencyName && utils.formatBytes32String(currencyName);
	currencyName = currencyName[0] === "p" ? currencyName.substring(1) : currencyName;

	const skip = page * first;

	const RateMapping = (data) => {
		return {
			...data,
		};
	};
	return {
		url: "",
		// query: gql`
		// 	query {
		// 		aggregatorChartRates(
		// 			skip: $skip
		// 			first: $first
		// 			where: { currencyName: $currencyName, timestamp: $searchDate }
		// 		) {
		// 			currencyName
		// 			price
		// 			low
		// 			high
		// 			timestamp
		// 		}
		// 	}
		// `,
		query: gql`
			query {
				aggregatorChartRates(currencyName: "BTC") {
					currencyName
					id
					low
					high
				}
			}
		`,
		variables: { currencyName, skip, first, searchDate },
		mapping: ({ data }) => {
			return data.chartRates.map((item) => RateMapping(item));
		},
		errorCallback: () => {
			return [
				RateMapping({
					price: 0,
					low: 0,
					high: 0,
					timestamp: 0,
				}),
			];
		},
	};
};
