import { getDecimal } from "lib/decimals/getDecimal";
import { toBytes32 } from "lib/bigInt";

import { contracts } from "../contract";
export const getExchangeRates = async (key: string) => {
    const { ExchangeRates } = contracts as any;
    const decimal = await getDecimal(key);

    if (decimal === 18n) {
        return BigInt((await ExchangeRates.rateForCurrency(toBytes32(key))).toString());
    } else {
        return BigInt((await ExchangeRates.rateForCurrency(toBytes32(key))).toString()) * 10n ** (18n - decimal);
    }
};
