import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ExchangeRatesState = {
	isReady?: boolean;
	PERI: bigint,
	USDC: bigint,
	DAI: bigint
}

const initialState: ExchangeRatesState = {
	isReady: false,
	PERI: 0n,
	USDC: 0n,
	DAI: 0n
}


export const ExchangeRatesSlice = createSlice({
	name: 'exchangeRates',
	initialState,
	reducers: {
		updateExchangeRates(state,  actions: PayloadAction<ExchangeRatesState>) {
			state.isReady = true;
			state.PERI = actions.payload.PERI;
			state.USDC = actions.payload.USDC;
			state.DAI = actions.payload.DAI;
		},
	},
});

export const { updateExchangeRates } = ExchangeRatesSlice.actions;

export default ExchangeRatesSlice.reducer;