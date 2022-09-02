import { exchangeHistories } from "../queries";
import { get } from "../service";

export const getExchangeHistories = async ({ address, page = 0, first = 1000 }) => {
	// let histories = await get(exchangeHistories({address, page, first}));

	let histories = [];
	return histories;
};
