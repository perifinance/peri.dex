import { fromBigNumber } from "lib/bigInt";

export const formatCurrency = (value:bigint, maxPrecision:number = 2) => {
    if (!value) return "0";

    // console.log("value", value);
    let precision = 0;
    const cutValue = 10n ** BigInt(18 - maxPrecision);
    const cutDecimals = (value / cutValue) * cutValue;
    const splitVal = fromBigNumber(cutDecimals).split(".");

    const decimalVal = Number(splitVal[0]);
    const fraction = splitVal[1] ? splitVal[1] : "0";

    precision =
        decimalVal < 100
            ? decimalVal < 10
                ? fraction?.length > 2 && !Number(fraction.substring(0, 2))
                    ? fraction?.length > 4 && !Number(fraction.substring(0, 4))
                        ? 8
                        : 6
                    : 5
                : 4
            : 2;

    if (maxPrecision < precision) precision = maxPrecision;

    const finalFraction = Math.round(Number(`0.${fraction}`) * 10 ** precision) / 10 ** precision;

    return `${decimalVal.toLocaleString("en", { maximumFractionDigits: precision })}${finalFraction
        .toFixed(precision)
        .substring(1)}`;
};

export const formatNumber = (value:number, maxPrecision:number = 2) => {
    if (!value) return "0";

    // console.log("value", value);
    let precision = 0;
    const cutValue = 10 ** (18 - maxPrecision);
    const cutDecimals = (value / cutValue) * cutValue;
    const splitVal = cutDecimals.toString().split(".");

    const decimalVal = Number(splitVal[0]);
    const fraction = splitVal[1] ? splitVal[1] : "0";

    precision =
        decimalVal < 100
            ? decimalVal < 10
                ? fraction?.length > 2 && !Number(fraction.substring(0, 2))
                    ? fraction?.length > 4 && !Number(fraction.substring(0, 4))
                        ? 8
                        : 6
                    : 5
                : 4
            : 2;

    if (maxPrecision < precision) precision = maxPrecision;

    const finalFraction = Math.round(Number(`0.${fraction}`) * 10 ** precision) / 10 ** precision;

    return `${decimalVal.toLocaleString("en", { maximumFractionDigits: precision })}${finalFraction
        .toFixed(precision)
        .substring(1)}`;
};