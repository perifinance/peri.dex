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
            roundIdForSrc: data.roundIdForSrc,
            roundIdForDest: data.roundIdForDest,
            amountReceived: BigInt(data.amountReceived),
            exchangeFeeRate: BigInt(data.exchangeFeeRate),
            srcRoundIdAtPeriodEnd: data.srcRoundIdAtPeriodEnd,
            destRoundIdAtPeriodEnd: data.srcRoundIdAtPeriodEnd,
            timestamp: dateFormat(data.timestamp),
        }
    }
    
    return {
        url: `Exchanger-Dev`,
        query: currencyName ? gql`
            query GetExchangeHistories($skip: Int!, $first: Int!, $address: String!) {
                exchangeHistories(skip: $skip, first: $first, where: {account: $address}, orderBy: timestamp, orderDirection: desc) {
                    id
                    account
                    src
                    amount
                    dest
                    amountReceived
                    exchangeFeeRate
                    roundIdForSrc
                    roundIdForDest
                    reclaim
                    rebate
                    srcRoundIdAtPeriodEnd
                    destRoundIdAtPeriodEnd
                    timestamp
                }
            }
        ` : gql`
            query GetExchangeEntrySettleds($skip: Int!, $first: Int!, $address: String!) {
                exchangeHistories(skip: $skip, first: $first, where: {account: $address}, orderBy: timestamp, orderDirection: desc) {
                    id
                    account
                    src
                    amount
                    dest
                    amountReceived
                    exchangeFeeRate
                    roundIdForSrc
                    roundIdForDest
                    reclaim
                    rebate
                    srcRoundIdAtPeriodEnd
                    destRoundIdAtPeriodEnd
                    timestamp
            }
        }`,
        variables: {currencyKey, address, skip, first},
        mapping: ({data}) => {    
            return data.exchangeHistories.map((item) => {
                return settledMap(item);
            });
        },
        errorCallback: () => {
            return []
        }
    }
}