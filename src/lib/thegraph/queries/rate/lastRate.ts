import { gql } from '@apollo/client'
import { utils } from 'ethers'
export const lastRate = ({currencyName = undefined, skip = 0, first = 1}) => {
    // const currencyKey = currencyName && utils.formatBytes32String(currencyName);

    // remove p
    if(currencyName !== null)
        currencyName = currencyName[0] === 'p' ? currencyName.substring(1):currencyName;
    
    const RateMapping = (data) => {
        let price = 0n
        try {
            price = BigInt(data.price);
        } catch(e) {

        }

        currencyName = data.currencyName[0] !== 'p' ? 'p'+data.currencyName:data.currencyName === 'pUSD'?'USD':data.currencyName

        // console.log('raynear:', price, currencyName)

        return {
            price,
            currencyName
        }
    }
    return {
        url: `ChainLinkPriceFeed`, // process.env.NODE_ENV==="production"?`ChainLinkPriceFeed`:`ExchangeRates-Dev`,
        // url: `ExchangeRates-Dev`,
        query: currencyName !== null ? gql`
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
            value['pUSD'] = 10n ** 18n
            return value;
        },
        errorCallback: () => {
            return RateMapping({price: 0n})
        }
    }
}