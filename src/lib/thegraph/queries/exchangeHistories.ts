import { gql } from '@apollo/client'
import { utils } from 'ethers'
import { dateFormat } from 'lib/format'
export const exchangeHistories = ({currencyName = undefined, address, page = 0, first = 100}) => {
    const currencyKey = currencyName && utils.formatBytes32String(currencyName);
    const skip = page * first;
    const settledMap = (data) => {
        return {
            id: data.id,
            src: utils.parseBytes32String(data.src),
            amount: BigInt(data.amount),
            dest: utils.parseBytes32String(data.dest),
            txid: data.txid,
            reclaim: BigInt(data.reclaim),
            rebate: BigInt(data.rebate),
            roundIdForSrc: data.roundIdForSrc,
            roundIdForDest: data.roundIdForDest,
            amountReceived: BigInt(data.amountReceived),
            exchangeFeeRate: BigInt(data.exchangeFeeRate),
            srcRoundIdAtPeriodEnd: data.srcRoundIdAtPeriodEnd,
            destRoundIdAtPeriodEnd: data.srcRoundIdAtPeriodEnd,
            timestamp: dateFormat(data.timestamp),
            state: data.state === 'settled' ? 'Success' : 'Proceeding',
            appendedTxid: data.appendedTxid,
            settledTxid: data.settledTxid
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
                    state
                    appendedTxid
                    settledTxid
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
                    state
                    appendedTxid
                    settledTxid
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