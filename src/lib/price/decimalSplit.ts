export const decimalSplit = (value: string) => {
	return value;

	if (!value) return "0";
	const splitStr = value.split(".");
	if (!splitStr[1]) return "0";
	const lastDecimal = splitStr[1].slice(0, 8);
	const result = [];
	const splitLast = lastDecimal.split("");
	splitLast.forEach((w, idx) => {
		if (w === "0" || splitLast[idx + 1] === "0") {
			return;
		}
		result[idx] = w;
	});
	splitStr[1] = result.reverse().join("");
	return splitStr.join(".");
};
