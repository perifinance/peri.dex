import { lastRate } from "../queries";

export const getLastRates = ({ networkId, currencyName = null }) => {
	return lastRate(networkId, currencyName);
};
