import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type LastRateData = {
    timestamp: number;
    rate: bigint;
    symbols: string;
    index: number;
};

export type ExchangeRatesState = {
    isReady?: boolean;
    PERI?: bigint;
    USDC?: bigint;
    DAI?: bigint;
    lastRateData: LastRateData;
};

const initialState: ExchangeRatesState = {
    isReady: false,
    PERI: 0n,
    USDC: 0n,
    DAI: 0n,
    lastRateData: {
        timestamp: 0,
        rate: 0n,
        symbols: "",
        index: 0,
    },
};

export const ExchangeRatesSlice = createSlice({
    name: "exchangeRates",
    initialState,
    reducers: {
        updateExchangeRates(state, actions: PayloadAction<ExchangeRatesState>) {
            return {
                ...state,
                isReady: true,
                PERI: actions.payload.PERI,
                USDC: actions.payload.USDC,
                DAI: actions.payload.DAI,
            };
        },
        updateLastRateData(state, actions: PayloadAction<LastRateData>) {
            // console.log("updateLastRateData", actions.payload);
            return { ...state, lastRateData: actions.payload };
        },
    },
});

export const { updateExchangeRates, updateLastRateData } = ExchangeRatesSlice.actions;

export default ExchangeRatesSlice.reducer;
