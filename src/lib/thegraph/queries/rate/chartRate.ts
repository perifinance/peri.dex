import { gql } from '@apollo/client'
import { timeStamp } from 'console';
import { utils } from 'ethers'
import { dateFormat } from 'lib'
export const chartRate = ({currencyName, page = 0, first = 1000}) => {
    const currencyKey = currencyName && utils.formatBytes32String(currencyName);
    console.log(currencyKey)
    const skip = page * first;
    
    const RateMapping = (data) => {
        let price;
        try {
            price = utils.formatEther(data.price)
        } catch(e) {

        }

        return {
            ...data,
            price,
            timestamp: dateFormat(data.timestamp)
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
            return [RateMapping({
                price: 0,
                low: 0,
                high: 0,
                timestamp: 0
            })]
        }
    }

}

