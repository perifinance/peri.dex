import { gql } from '@apollo/client'
import { utils } from 'ethers'

export const chartRate = ({currencyName, page = 0, first = 1000, searchDate = 0}) => {
    // const currencyKey = currencyName && utils.formatBytes32String(currencyName);
    currencyName = currencyName[0] === 'p' ? currencyName.substring(1):currencyName;

    const skip = page * first;
    
    const RateMapping = (data) => {
        return {
            ...data
        }
    }
    return {
        url: `ChainLinkPriceFeed`, // process.env.NODE_ENV==="production"?`ChainLinkPriceFeed`:`ExchangeRates-Dev`,
        // url: `ExchangeRates-Dev`,
        query:
        // process.env.NODE_ENV==="production"?
        gql`
            query GetChartRates($currencyName: String!, $skip: Int!, $first: Int!, $searchDate: BigInt!) {
                chartRates(skip: $skip, first: $first, where: {currencyName: $currencyName, timestamp_gt: $searchDate}, orderBy: timestamp, orderDirection: asc) {
                    price
                    low
                    high
                    timestamp
                }
            }`,// :
            // gql`query GetChartRates($currencyKey: String!, $skip: Int!, $first: Int!, $searchDate: Int!) {
            //     chartRates(skip: $skip, first: $first, where: {currencyKey: $currencyKey, timestamp_gt: $searchDate}, orderBy: timestamp, orderDirection: asc) {
            //         price
            //         low
            //         high
            //         timestamp
            //     }
            // }`,
        // query: gql`
        //     query GetChartRates($currencyKey: String!, $skip: Int!, $first: Int!, $searchDate: Int!) {
        //         chartRates(skip: $skip, first: $first, where: {currencyKey: $currencyKey, timestamp_gt: $searchDate}, orderBy: timestamp, orderDirection: asc) {
        //             price
        //             low
        //             high
        //             timestamp
        //         }
        //     }
        // `,
        variables: {currencyName, skip, first, searchDate},
        mapping: ({data}) => {    
            
            return data.chartRates.map((item) => RateMapping(item));
        },
        errorCallback: () => {
            return [RateMapping({
                price: 0,
                low: 0,
                high: 0,
                timestamp: 0
            })]
        }
    }

}

