// import {balance} from "../queries";
// import {get} from "../service";

import pynths from "configure/coins/pynths";

import { contracts } from "lib/contract";
import { PynthBalance } from "reducers/wallet/pynthBlances";

// import { getLastRates } from "./getLastRates";

export const getBalance = async (
    address: string,
    coinName: string,
    decimal: number = 18,
    list: boolean = false,
    rate: bigint = 0n
): Promise<PynthBalance | bigint> => {
    const balanceMapping = (data: bigint): PynthBalance => {
        let amount = 0n;
        try {
            amount = data;
        } catch (e) {
            amount = 0n;
        }

        return {
            currencyName: coinName,
            amount,
            balanceToUSD: coinName === "pUSD" ? amount : (amount * rate) / 10n ** 18n,
        };
    };

    // console.log(`ProxyERC20${coinName}`, contracts[`ProxyERC20${coinName}`]);

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

export const getBalances = async ({
    currencyName = undefined,
    networkId = undefined,
    address,
    rates = undefined,
}): Promise<PynthBalance[] | PynthBalance | bigint> => {
    try {
        if (currencyName) {
            return getBalance(address, currencyName);
        } else {
            const retList = [];

            const splitSize = 25;
            const pynthList: Array<any> = pynths[networkId];
            const len = pynthList?.length ? pynthList.length / splitSize: 0n;
            for (let i = 0; i < len; i++) {
                const start = i * splitSize;
                const end = start + splitSize;
                const splitedList = pynthList.slice(start, end >= pynthList.length ? pynthList.length - 1 : end);
                const list = await Promise.all(
                    splitedList.map(
                        async (pynth: any, idx: number) =>
                            // getLastRates([pynth.symbol]).then(
                            // async (rate) =>
                            await getBalance(address, pynth.symbol, 18, true, /* rate ? rate[0].price : */ 0n)
                        // )
                    )
                );
                retList.push(...list);
            }

            return retList;
        }
    } catch (e) {
        console.error("getBalances ERROR:", e);
    }
};
