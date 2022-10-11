export const decimalSplit = (value: string | number) => {
	// return value;

	if (!value) return "0";
	const splitStr = String(value).split(".");
	if (!splitStr[1]) return splitStr[0];

	if (Number(splitStr[0]) > 10) {
		return `${splitStr[0]}.${splitStr[1].slice(0, 2)}`;
	} else if (Number(splitStr[0]) > 0) {
		return `${splitStr[0]}.${splitStr[1].slice(0, 4)}`;
	} else {
		return `${splitStr[0]}.${splitStr[1].slice(0, 8)}`;
	}
};
