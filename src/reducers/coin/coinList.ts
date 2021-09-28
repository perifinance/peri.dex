import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Coin = {
    id?: number,
    favorite?: boolean,
    name?: string,
    symbol?: string,
    categories?: Array<string>,
    decimal?: number
}
type CoinList = {
	coinList: Array<Coin>
}

const initialState: CoinList = {
	coinList: []
};

export const coinListSlice = createSlice({
	name: 'coinList',
	initialState,
	reducers: {
		initCoinList: (state, actions: PayloadAction<CoinList>) => {
			state.coinList = [].concat(actions.payload);
		},

		updateCoin: (state, actions: PayloadAction<Coin>) => {
			state.coinList[actions.payload.id] = actions.payload
		}
	},
});

export const {
	initCoinList,
	updateCoin,
} = coinListSlice.actions;

export default coinListSlice.reducer;