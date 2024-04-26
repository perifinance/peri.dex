import { fromBigNumber } from "lib/bigInt";

export const formatCurrency = (value, maxPrecision = 2) => {
    if (!value) return "0";

    let precision = 0;
    const cutValue = 10n ** BigInt(18 - maxPrecision);
    const cutDecimals = (value / cutValue) * cutValue;
    const splitVal = fromBigNumber(cutDecimals).split(".");

    const decimalVal = Number(splitVal[0]);
    const fraction = splitVal[1] ? splitVal[1] : "0";

    precision =
        decimalVal < 10
            ? fraction?.length > 2 && !Number(fraction.substring(0, 1))
                ? fraction?.length > 4 && !Number(fraction.substring(0, 4))
                    ? 8
                    : 6
                : 4
            : 2;

    if (maxPrecision < precision) precision = maxPrecision;

    const finalFraction = Math.round(Number(`0.${fraction}`) * 10 ** precision) / 10 ** precision;

    return `${decimalVal.toLocaleString("en", { maximumFractionDigits: precision })}${finalFraction
        .toFixed(precision)
        .substring(1)}`;
};
