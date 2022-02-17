import { gql } from '@apollo/client'
import { utils } from 'ethers'
export const lastRate = ({currencyName = undefined, skip = 0, first = 1}) => {
    const currencyKey = currencyName && utils.formatBytes32String(currencyName);
    
    const RateMapping = (data) => {
        let price = 0n
        try {
            price = BigInt(data.price);
        } catch(e) {

        }

        return {
            price,
            currencyName: data.currencyKey && utils.parseBytes32String(data.currencyKey)
        }
    }
    return {
        url: `AccessControlledAggregator`,
        query: currencyName ? gql`
            query GetLastRates($currencyKey: String!, $skip: Int!, $first: Int!) {
                lastRates(skip: $skip, first: $first, where: {currencyKey: $currencyKey}) {
                    price
                    currencyKey
                }
            }
        ` : gql`
            query GetLastRates {
                lastRates(skip: 0, first:1000) {
                    price
                    currencyKey
            }
        }`,
        variables: {currencyKey, skip, first},
        mapping: ({data}) => {    
            let value = {};
            data.lastRates.forEach(element => {
                const item = RateMapping(element);
                value[item.currencyName] = item.price;
            });
            value['pUSD'] = 10n ** 18n
            return value;
        },
        errorCallback: () => {
            return RateMapping({price: 0n})
        }
    }
}