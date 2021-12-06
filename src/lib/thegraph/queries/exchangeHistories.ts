import { gql } from '@apollo/client'
import { utils } from 'ethers'
import { dateFormat } from 'lib/format'
export const exchangeHistories = ({currencyName = undefined, address, page = 0, first = 10}) => {
    const currencyKey = currencyName && utils.formatBytes32String(currencyName);
    const skip = page * first;
    const settledMap = (data) => {
        return {
            id: data.id,
            src: utils.parseBytes32String(data.src),
            amount: BigInt(data.amount),
            dest: utils.parseBytes32String(data.dest),
            txid: (data.id).replace(/-\d+/g, ''),
            reclaim: BigInt(data.reclaim),
            rebate: BigInt(data.rebate),
            srcRoundIdAtPeriodEnd: data.srcRoundIdAtPeriodEnd,
            destRoundIdAtPeriodEnd: data.srcRoundIdAtPeriodEnd,
            timestamp: dateFormat(data.timestamp)
        }
    }
    
    return {
        url: `Exchanger-Dev`,
        query: currencyName ? gql`
            query GetExchangeEntrySettleds($currencyKey: String!, $skip: Int!, $first: Int!, $address: String!) {
                exchangeEntrySettleds(skip: $skip, first: $first, where: {currencyKey: $currencyKey, from: $address}, orderby: timestamp) {
                    id
                    from
                    src
                    amount
                    dest
                    reclaim
                    rebate
                    srcRoundIdAtPeriodEnd
                    destRoundIdAtPeriodEnd
                    timestamp
                }
            }
        ` : gql`
            query GetExchangeEntrySettleds($address: String!) {
                exchangeEntrySettleds(skip: $skip, first: $first where: {from: $address}, orderby: timestamp) {
                    id
                    from
                    src
                    amount
                    dest
                    reclaim
                    rebate
                    srcRoundIdAtPeriodEnd
                    destRoundIdAtPeriodEnd
                    timestamp
            }
        }`,
        variables: {currencyKey, address, skip, first},
        mapping: ({data}) => {    
            return data.exchangeEntrySettleds.map((item) => {
                return settledMap(item);
            });
        },
        errorCallback: () => {
            return []
        }
    }
}