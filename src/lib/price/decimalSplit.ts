export const decimalSplit = (value: string) => {
	if (!value) {
		return value;
	}

	const splitValue = value.split(".");

	if (splitValue && splitValue[1] && splitValue[1][1]) {
		splitValue[1][1] === "0" ? (splitValue[1] = splitValue[1].slice(0, 4)) : (splitValue[1] = splitValue[1].slice(0, 2));
	}

	return splitValue.join(".");
};
