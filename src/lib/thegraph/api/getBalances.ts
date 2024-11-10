// import {balance} from "../queries";
// import {get} from "../service";

import pynths from "configure/coins/pynths";
import { toNumber } from "lib/bigInt";

import { contracts } from "lib/contract";
import { PynthBalance } from "reducers/wallet/pynthBlances";

// import { getLastRates } from "./getLastRates";

export const getBalance = async (
    address: string,
    coinName: string,
    decimal: number = 18,
    list: boolean = false,
    rate: number = 0
): Promise<PynthBalance | bigint> => {
    const balanceMapping = (data: bigint): PynthBalance => {
        let amount = 0;
        try {
            amount = Math.round(toNumber(data)*10**6)/10**6;
        } catch (e) {
            amount = 0;
        }

        return {
            currencyName: coinName,
            amount,
            balanceToUSD: coinName === "pUSD" ? amount : (amount * rate),
        };
    };

    // console.log(`ProxyERC20${coinName}`, contracts[`ProxyERC20${coinName}`]);

    if (contracts.chainId > 0) {
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
                            await getBalance(address, pynth.symbol, 18, true, /* rate ? rate[0].price : */ 0)
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
