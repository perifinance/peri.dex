import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Coin = {
    id?: number;
    favorite?: boolean;
    name?: string;
    key?: string;
    symbol?: string;
    categories?: Array<string>;
    decimal?: number;
    index?: number;
};

export type selectedCoin = {
    source: Coin;
    destination: Coin;
};

const initialState: selectedCoin = {
    source: {},
    destination: {},
};

export const loadingSlice = createSlice({
    name: "selectedCoin",
    initialState,
    reducers: {
        setSourceCoin: (state, actions: PayloadAction<Coin>) => {
            return { ...state, source: actions.payload };
        },

        setDestinationCoin: (state, actions: PayloadAction<Coin>) => {
            return { ...state, destination: actions.payload };
        },
        setSelectedCoin: (state, actions: PayloadAction<selectedCoin>) => {
            return { ...state, ...actions.payload };
        }
    },
});

export const { setSelectedCoin, setSourceCoin, setDestinationCoin } = loadingSlice.actions;

export default loadingSlice.reducer;
