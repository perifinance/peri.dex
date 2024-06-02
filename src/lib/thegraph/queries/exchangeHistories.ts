import { gql } from "@apollo/client";
import { utils } from "ethers";
import {
	formatDate,
	// formatTimestamp
} from "lib/format";
export const exchangeHistories = ({ address, page = 0, first = 100 }) => {
	const variables = {
		address: address.toLowerCase(),
		skip: page * first,
		first,
	};

	const settledMap = (data) => {
		return {
			id: data.id,
			src: utils.parseBytes32String(data.src),
			amount: BigInt(data.amount),
			chainId: data.chainId,
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
			timestamp: data.timestamp,
			date: formatDate(data.timestamp),
			state: data.state === "settled" ? "Settled" : "Appended",
			appendedTxid: data.appendedTxid,
			settledTxid: data.settledTxid,
		};
	};

	return {
		url: ``,
		query: gql`
			query {
				exchangeHistory(
					skip: ${variables.skip},
					first: ${variables.first},
					account: ${JSON.stringify(variables.address)}
				) {
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
					chainId
				}
			}
		`,
		// query: gql`
		// 	query GetExchangeEntrySettleds($skip: Int!, $first: Int!, $address: String!) {
		// 		exchangeHistories(
		// 			skip: $skip
		// 			first: $first
		// 			where: { account: $address }
		// 			orderBy: timestamp
		// 			orderDirection: desc
		// 		) {
		// 			id
		// 			account
		// 			src
		// 			amount
		// 			dest
		// 			amountReceived
		// 			exchangeFeeRate
		// 			roundIdForSrc
		// 			roundIdForDest
		// 			reclaim
		// 			rebate
		// 			srcRoundIdAtPeriodEnd
		// 			destRoundIdAtPeriodEnd
		// 			timestamp
		// 			state
		// 			appendedTxid
		// 			settledTxid
		// 		}
		// 	}
		// `,
		variables,
		mapping: ({ data }) => {
			return data.exchangeHistory.map((item) => {
				return settledMap(item);
			});
		},
		errorCallback: () => {
			return [];
		},
	};
};
