import { gql } from "@apollo/client";

export const balance = ({ currencyName, address, rate = 0n }) => {
	const balanceMapping = (data) => {
		let amount = 0n;
		try {
			amount = BigInt(data.amount);
		} catch (e) {
			amount = 0n;
		}

		return {
			currencyName: currencyName,
			amount,
			balanceToUSD: (amount * rate) / 10n ** 18n,
		};
	};
	return {
		url: `ProxyERC20${currencyName}-Real`, // process.env.NODE_ENV==="production"?`ProxyERC20${currencyName}-Real`:`ProxyERC20${currencyName}-Dev`,
		// url: `ProxyERC20${currencyName}-Dev`,
		query: gql`
			query GetLastPynthBalances($account: String!) {
				lastPynthBalances(skip: 0, first: 1, where: { account: $account }) {
					id
					address
					account
					timestamp
					pynthName
					amount
				}
			}
		`,
		variables: { account: address },
		mapping: ({ data }) => {
			return data.lastPynthBalances.length > 0
				? data.lastPynthBalances.map((e) => {
						return balanceMapping(e);
				  })[0]
				: balanceMapping({ amount: 0n, currencyName });
		},
		errorCallback: () => {
			return balanceMapping({ amount: 0n, currencyName });
		},
	};
};
