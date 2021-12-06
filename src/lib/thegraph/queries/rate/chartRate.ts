import { gql } from '@apollo/client'
import { utils } from 'ethers'
export const chartRate = ({currencyName, page = 0, first = 1000}) => {
    const currencyKey = currencyName && utils.formatBytes32String(currencyName);
    const skip = page * first;
    
    const RateMapping = (data) => {
        let price;
        try {
            price = utils.formatEther(data.price)
        } catch(e) {

        }

        return {
            ...data,
            price
        }
    }
    return {
        url: `ExchangeRates-Dev`,
        query: gql`
            query GetChartRates($currencyKey: String!, $skip: Int!, $first: Int!) {
                chartRates(skip: $skip, first: $first, where: {currencyKey: $currencyKey}, orderBy: timestamp, orderDirection: asc) {
                    price
                    low
                    high
                    timestamp
                }
            }
        `,
        variables: {currencyKey, skip, first},
        mapping: ({data}) => {    
            
            return data.chartRates.map((item) => RateMapping(item));
        },
        errorCallback: () => {
            return []
        }
    }

}

