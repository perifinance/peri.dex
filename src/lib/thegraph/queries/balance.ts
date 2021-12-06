import { gql } from '@apollo/client'

export const balance = ({currencyName, address, rate = 0n}) => {

    const balanceMapping = (data) => {
        let amount = 0n;
        try {
            amount = BigInt(data.amount)
        } catch (e){
            amount = 0n;
        }
        return {
            currencyName: data.pynthName,
            amount,
            balanceToUSD: amount * rate / (10n ** 18n)
        }
    }
    return {
        url: `ProxyERC20${currencyName}-Dev`,
        query: gql`
            query GetExchangeRates($address: String!) {
                lastPynthBalances(skip: 0, first:1, where: {account: $address}) {
                    id
                    address
                    account
                    timestamp
                    pynthName
                    amount
                }
            }
        `,
        variables: {address},
        mapping: ({data}) => {    
            return data.lastPynthBalances.map((e) => {
                return balanceMapping(e)
            })[0]
        },
        errorCallback: () => {
            return balanceMapping({amount: 0n})
        }
    }
}