import { gql } from '@apollo/client'
import { utils } from 'ethers'
export const lastRate = ({currencyName = undefined, skip = 0, first = 1}) => {
    
    const RateMapping = (data) => {
        let price = 0n
        try {
            price = BigInt(data.price);
        } catch(e) {

        }

        return {
            price,
            currencyName: data.currencyName
        }
    }
    return {
        url: `AccessControlledAggregator`,
        query: currencyName ? gql`
            query GetLastRates($currencyName: String!, $skip: Int!, $first: Int!) {
                lastRates(skip: $skip, first: $first, where: {currencyName: $currencyName}) {
                    price
                    currencyName
                }
            }
        ` : gql`
            query GetLastRates {
                lastRates(skip: 0, first:1000) {
                    price
                    currencyName
            }
        }`,
        variables: {currencyName, skip, first},
        mapping: ({data}) => {    
            let value = {};
            data.lastRates.forEach(element => {
                const item = RateMapping(element);
                value[item.currencyName] = item.price;
            });
            value['USD'] = 10n ** 18n
            return value;
        },
        errorCallback: () => {
            return RateMapping({price: 0n})
        }
    }
}