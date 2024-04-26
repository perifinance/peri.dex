import { gql } from "@apollo/client";

import { toBytes32 } from "lib/bigInt";

export const periChartRates = ({ currencyName, page = 0, first = 1000, searchDate = "0", networkId }) => {
    const currencyKey = currencyName && toBytes32(currencyName);
    currencyName = currencyName[0] === "p" ? currencyName.substring(1) : currencyName;
    const skip = page * first;

    const RateMapping = (data) => {
        return {
            price: Number(data.price),
            low: Number(data.low),
            high: Number(data.high),
            timestamp: Number(data.timestamp),
        };
    };

    return {
        url: "",
        query: gql`
			query {
				periChartRate(first: ${first}, skip: ${skip}, currencyKey: "${currencyKey}", network: ${networkId}) {
					timestamp
					price
					low
					high
					currencyKey
				}
			}
		`,
        variables: { currencyKey, skip, first, searchDate },
        mapping: ({ data }) => {
            return data.periChartRate.map((item) => RateMapping(item));
        },
        errorCallback: (e) => {
            console.log(e);
            return [
                RateMapping({
                    price: 0,
                    low: 0,
                    high: 0,
                    timestamp: 0,
                }),
            ];
        },
        networkId,
    };
};
