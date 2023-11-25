import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Coin = {
    id?: number,
    favorite?: boolean,
    name?: string,
    symbol?: string,
    categories?: Array<string>,
    decimal?: number,
	balance?: bigint
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
			return {...state,coinList: [].concat(actions.payload)};
		},

		updateCoin: (state, actions: PayloadAction<Coin>) => {
			let coinList = {...state.coinList};
			coinList[actions.payload.id] = actions.payload;
			return {...state, coinList}
		}
	},
});

export const {
	initCoinList,
	updateCoin,
} = coinListSlice.actions;

export default coinListSlice.reducer;