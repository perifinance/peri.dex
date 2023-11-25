import { lastRate } from "../queries";
import { get } from "../service";
export interface ICurrencyRate {
	currencyKey: string;
	price: bigint;
	timestamp: number;
}
export const getLastRates = async (currencyKeys: any[]):Promise<ICurrencyRate[]> => {
	if (currencyKeys.length < 1) return undefined;

	const rates = await get(lastRate({ currencyKeys }));

	return rates.length > 0 ? rates : undefined;
};

