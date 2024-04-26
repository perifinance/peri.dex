import { toBytes32 } from "lib/bigInt";

import { contracts } from "../contract";

export const getFeeRateForExchange = async (sourceSymbol, destinationSymbol) => {
    const { Exchanger } = contracts as any;

    // console.log(toBytes32(sourceSymbol),toBytes32(destinationSymbol));
    let fee = BigInt(0);
    try {
        fee = BigInt(await Exchanger.feeRateForExchange(toBytes32(sourceSymbol), toBytes32(destinationSymbol)));
    } catch (e) {
        console.error("getFeeRateForExchange ERROR:", e);
    }

    return fee;
};
