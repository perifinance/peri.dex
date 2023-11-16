// import {balance} from "../queries";
// import {get} from "../service";

import pynths from "configure/coins/pynths";
import { contracts } from "lib/contract";
import { getLastRates } from "./getLastRates";

export const getBalance = async (
	address: string,
	coinName: string,
	decimal: number = 18,
	list: boolean = false,
	rate: bigint = 0n
) => {
	const balanceMapping = (data: bigint) => {
		let amount = 0n;
		try {
			amount = data;
		} catch (e) {
			amount = 0n;
		}

		return {
			currencyName: coinName,
			amount,
			balanceToUSD: (amount * rate) / 10n ** 18n,
		};
	};

	try {
		if (decimal === 18) {
			return list
				? balanceMapping(BigInt((await contracts[`ProxyERC20${coinName}`].balanceOf(address)).toString()))
				: BigInt((await contracts[`ProxyERC20${coinName}`].balanceOf(address)).toString());
		} else {
			return list
				? balanceMapping(
						BigInt((await contracts[`ProxyERC20${coinName}`].balanceOf(address)).toString()) *
							BigInt(Math.pow(10, 18 - decimal).toString())
				  )
				: BigInt((await contracts[`ProxyERC20${coinName}`].balanceOf(address)).toString()) *
						BigInt(Math.pow(10, 18 - decimal).toString());
		}
	} catch (e) {
		console.error("getBalance error", e);
	}
	return 0n;
};

export const getBalances = async ({ currencyName = undefined, networkId = undefined, address, rates = undefined }) => {
	try {
		if (currencyName) {
			return getBalance(address, currencyName);
		} else {
			const promises = [];

			await Promise.all(
				pynths[networkId].map(async (pynth: any, idx: number) =>
					getLastRates({ networkId, currencyName: pynth.symbol }).then(
						async (rate) => (promises[idx] = await getBalance(address, pynth.symbol, 18, true, rate))
					)
				)
			);

			return promises;
		}
	} catch (e) {
		console.error("getBalances ERROR:", e);
	}
};
