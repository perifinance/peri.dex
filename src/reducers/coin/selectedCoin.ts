import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Coin = {
    id?: number,
    favorite?: boolean,
    name?: string,
    symbol?: string,
    categories?: Array<string>,
    decimal?: number
}

export type selectedCoin = {
	source: Coin
    destination: Coin
};

const initialState: selectedCoin = {
	source: {},
    destination: {}
};

export const loadingSlice = createSlice({
	name: 'selectedCoin',
	initialState,
	reducers: {
        setSourceCoin: (state, actions: PayloadAction<Coin>) => {
            state.source = actions.payload;
        },

        setDestinationCoin: (state, actions: PayloadAction<Coin>) => {
            state.destination = actions.payload;
        }
	},
});

export const {
	setSourceCoin,
    setDestinationCoin,
} = loadingSlice.actions;

export default loadingSlice.reducer;
