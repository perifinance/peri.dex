
export const decimalSplit = (value: string | number, grand: boolean = false) => {
    if (!value) return "0";

    const splitStr = String(value).replace(",", "").split(".");

    const decimalStr = splitStr[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const fraction = splitStr[1] ? splitStr[1] : "0";

    let decimalVal = Number(splitStr[0]);
    if (grand) {
        const tempVal =
            decimalVal < 1000000000
                ? decimalVal < 100000000
                    ? decimalVal < 10000000
                        ? decimalVal < 1000000
                            ? decimalVal < 100000
                                ? decimalVal < 10000
                                    ? (decimalVal / 1000).toFixed(2) + "K"
                                    : (decimalVal / 1000).toFixed(1) + "K"
                                : decimalVal / 1000 + "K"
                            : (decimalVal / 1000000).toFixed(2) + "M"
                        : (decimalVal / 1000000).toFixed(1) + "M"
                    : decimalVal / 1000000 + "M"
                : (decimalVal / 1000000000).toFixed(2) + "B";

        return tempVal;
    }

    const precision =
        decimalVal < 10
            ? fraction?.length > 2 && !Number(fraction.substring(0, 1))
                ? fraction?.length > 4 && !Number(fraction.substring(0, 4))
                    ? 8
                    : 6
                : 4
            : 2;
    // console.log("decimalSplit", value, decimalVal, precision);
    return `${decimalStr}${Number(`0.${fraction}`).toFixed(precision).substring(1)}`;
    // return `${decimalStr}.${fraction?.slice(0, precision)}`;
};

export const getPrecision = (value: string | number) => {
    if (!value) return 0;

    const splitStr = String(value).split(".");
    const decimalNum = Number(splitStr[0]);

    return decimalNum < 10 ? (decimalNum < 0 ? 8 : 4) : 2;
};
