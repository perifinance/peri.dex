import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ExchangeRatesState = {
	isReady?: boolean;
	PERI?: bigint;
	USDC?: bigint;
	DAI?: bigint;
	close?: string;
	tooltip?: { open: any; close: any; high: any; low: any; year: any; month: any; day: any };
};

const initialState: ExchangeRatesState = {
	isReady: false,
	PERI: 0n,
	USDC: 0n,
	DAI: 0n,
	close: "0",
	tooltip: { open: 0, close: 0, high: 0, low: 0, year: 0, month: 0, day: 0 },
};

export const ExchangeRatesSlice = createSlice({
	name: "exchangeRates",
	initialState,
	reducers: {
		updateExchangeRates(state, actions: PayloadAction<ExchangeRatesState>) {
			state.isReady = true;
			state.PERI = actions.payload.PERI;
			state.USDC = actions.payload.USDC;
			state.DAI = actions.payload.DAI;
		},
		updatePrice(state, actions: PayloadAction<ExchangeRatesState>) {
			state.close = actions.payload.close;
		},
		updateTooltip(state, actions: PayloadAction<ExchangeRatesState>) {
			state.tooltip = { ...state.tooltip, ...actions.payload };
		},
	},
});

export const { updateExchangeRates, updatePrice, updateTooltip } = ExchangeRatesSlice.actions;

export default ExchangeRatesSlice.reducer;
