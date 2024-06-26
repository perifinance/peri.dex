import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type LastRateData = {
    timestamp: number;
    rate: number;
    symbol: string;
    index: number;
};

export type ExchangeRatesState = {
/*     isReady?: boolean;
    PERI?: number;
    USDC?: number;
    DAI?: number; */
    lastRateData: LastRateData;
};

const initialState: ExchangeRatesState = {
/*     isReady: false,
    PERI: 0,
    USDC: 0,
    DAI: 0, */
    lastRateData: {
        timestamp: 0,
        rate: 0,
        symbol: "",
        index: 0,
    },
};

export const ExchangeRatesSlice = createSlice({
    name: "exchangeRates",
    initialState,
    reducers: {
        /* updateExchangeRates(state, actions: PayloadAction<ExchangeRatesState>) {
            return {
                ...state,
                isReady: true,
                PERI: actions.payload.PERI,
                USDC: actions.payload.USDC,
                DAI: actions.payload.DAI,
            };
        }, */
        updateLastRateData(state, actions: PayloadAction<LastRateData>) {
            // console.log("updateLastRateData", actions.payload);
            return { ...state, lastRateData: actions.payload };
        },
    },
});

export const { /* updateExchangeRates,  */updateLastRateData } = ExchangeRatesSlice.actions;

export default ExchangeRatesSlice.reducer;
