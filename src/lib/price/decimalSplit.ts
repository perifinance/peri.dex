export const decimalSplit = (value: string | number) => {

	if (!value) return "0";
	const splitStr = String(value).replace(",", "").split(".");
	
	const decimalStr = splitStr[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
	
	if (!splitStr[1]) return `${decimalStr}.00`;
	
	const decimalNum =  Number(splitStr[0]);
	const precision = (decimalNum > 0) ? (decimalNum > 10) ? 2 : 4 : 8;
	// console.log("decimalSplit", splitStr, decimalNum, precision);
	return `${decimalStr}.${splitStr[1].slice(0, precision)}`;
};

export const getPrecision = (value: string | number) => {
	if (!value) return 0;

	const splitStr = String(value).split(".");
	const decimalNum =  Number(splitStr[0]);

	return decimalNum < 10 ? decimalNum < 0 ? 8 : 4 : 2
}
