import { gql } from '@apollo/client'
import { utils } from 'ethers'

export const chartRate = ({currencyName, page = 0, first = 1000, searchDate = 0}) => {
    const skip = page * first;
    
    const RateMapping = (data) => {
        return {
            ...data
        }
    }
    return {
        url: process.env.REACT_APP_ENV === 'development' ? 'ExchangeRates-Dev' : 'AccessControlledAggregator',
        query: gql`
            query GetChartRates($currencyName: String!, $skip: Int!, $first: Int!, $searchDate: Int!) {
                chartRates(skip: $skip, first: $first, where: {currencyName: $currencyName, timestamp_gt: $searchDate}, orderBy: timestamp, orderDirection: asc) {
                    price
                    low
                    high
                    timestamp
                }
            }
        `,
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

