export const decimalSplit = (value: string | number) => {

	if (!value) return "0";

	const splitStr = String(value).replace(",", "").split(".");
	
	const decimalStr = splitStr[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
	const fraction = splitStr[1]?splitStr[1]:"0";

	const decimalVal =  Number(splitStr[0]);
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
	const decimalNum =  Number(splitStr[0]);

	return decimalNum < 10 ? decimalNum < 0 ? 8 : 4 : 2
}
