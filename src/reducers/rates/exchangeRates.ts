import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ExchangeRatesState = {
	isReady?: boolean;
	PERI?: bigint;
	USDC?: bigint;
	DAI?: bigint;
	close?: string;
};

const initialState: ExchangeRatesState = {
	isReady: false,
	PERI: 0n,
	USDC: 0n,
	DAI: 0n,
	close: "0",
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
	},
});

export const { updateExchangeRates, updatePrice } = ExchangeRatesSlice.actions;

export default ExchangeRatesSlice.reducer;
