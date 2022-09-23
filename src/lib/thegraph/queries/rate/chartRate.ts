import { gql } from "@apollo/client";

export const chartRate = ({ currencyName, page = 0, first = 1000, searchDate = 0 }) => {
	currencyName = currencyName[0] === "p" ? currencyName.substring(1) : currencyName;

	const skip = page * first;

	const RateMapping = (data) => {
		return {
			...data,
		};
	};

	return {
		url: "",
		query: gql`
			query {
				aggregatorChartRates(currencyName: "${
					currencyName === "1INCH" ? "INCH" : currencyName
				}", timestamp: ${searchDate}, skip: ${skip}, take: ${first}) {
					currencyName
					price
					id
					low
					high
					timestamp
				}
			}
		`,
		variables: { currencyName, skip, first, searchDate },
		mapping: ({ data }) => {
			const aggregatorChartRates = data.aggregatorChartRates;
			return aggregatorChartRates.map((item) => RateMapping(item));
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
