import { gql } from "@apollo/client";

export const chartRates = ({ currencyName, page = 0, first = 1000, searchDate = 0 }) => {
    currencyName = currencyName[0] === "p" ? currencyName.substring(1) : currencyName;
    const skip = page * first;

    const RateMapping = (data) => {
        return {
            currencyName: data.currencyName,
            price: data.price,
            low: data.low,
            high: data.high,
            timestamp: data.timestamp,
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
					low
					high
					timestamp
				}
			}
		`,
        variables: { currencyName, skip, first, searchDate },
        mapping: ({ data }) => {
            // const aggregatorChartRates = data.aggregatorChartRates;
            return data.aggregatorChartRates.map((item) => RateMapping(item));
        },
        errorCallback: () => {
            return [
                RateMapping({
                    currencyName,
                    price: 0,
                    low: 0,
                    high: 0,
                    timestamp: 0,
                }),
            ];
        },
    };
};
