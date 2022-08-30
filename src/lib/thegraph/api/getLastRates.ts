import { lastRate } from "../queries";

export const getLastRates = ({ currencyName = null }) => {
	return lastRate(currencyName);
};
