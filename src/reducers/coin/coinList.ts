import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Coin = {
    id?: number;
    favorite?: boolean;
    name?: string;
    symbol?: string;
    categories?: Array<string>;
    decimal?: number;
    key?: string;
    price?: bigint;
    change?: bigint;
    timestamp?: number;
    isActive?: boolean;
    upDown?: number;
    high?: bigint;
    low?: bigint;
    preClose?: bigint;
};
export type CoinList = {
    coinList: Array<Coin>;
};

const initialState: CoinList = {
    coinList: [],
};

export const coinListSlice = createSlice({
    name: "coinList",
    initialState,
    reducers: {
        initCoinList: (state, actions: PayloadAction<CoinList>) => {
            return { ...state, coinList: [].concat(actions.payload) };
        },

        updateCoin: (state, actions: PayloadAction<Coin>) => {
            const idx = state.coinList.findIndex((coin) => coin.id === actions.payload.id);
            if (idx === -1) {
                return;
            }
            const existCoin = state.coinList[idx];
            // console.log(existCoin.timestamp, actions.payload.timestamp);
            if (existCoin.timestamp > actions.payload.timestamp || existCoin.price === actions.payload.price) {
                return;
            }
            const change = existCoin.preClose 
                ? (actions.payload.price - existCoin.preClose) * 10n**18n / existCoin.preClose * 100n 
                : 0n;
            const upDown = existCoin.price === actions.payload.price
                ? 0
                : existCoin.price < actions.payload.price
                    ? 1
                    : -1;
            const high = actions.payload.price > existCoin.high ? actions.payload.price : existCoin.high;
            const low = existCoin.low !== 0n && actions.payload.price < existCoin.low ? actions.payload.price : existCoin.low;
            const newCoin = {...state.coinList[idx], timestamp:actions.payload.timestamp, price:actions.payload.price
                , high, low, change, upDown};
            state.coinList[idx] = newCoin;
            return;
        },
        updateFavorite: (state, actions: PayloadAction<Coin>) => {
            const idx = state.coinList.findIndex((coin) => coin.id === actions.payload.id);
            if (idx === -1) {
                return state;
            }
            state.coinList[idx].favorite = actions.payload.favorite;
            return state;
        },
        updatePrice: (state, actions: PayloadAction<any>) => {
            let existList = [].concat(state.coinList);
            const payload = actions.payload;
            const newList = existList.map((coin) => {
                const newCoin = {
                    ...coin,
                    price: payload[coin.symbol]?.price ? payload[coin.symbol].price : coin.price,
                    change: payload[coin.symbol]?.change ? payload[coin.symbol].change : coin.change,
                    timestamp: payload[coin.symbol]?.timestamp ? payload[coin.symbol].timestamp : coin.timestamp,
                };
				// console.log(newCoin, payload[coin.symbol]);
				return newCoin;
            });
            actions.payload = null;
            existList = null;
            
            // console.log(newList);
            return { ...state, coinList: newList };
        },
        updateChange: (state, actions: PayloadAction<Coin>) => {
            const idx = state.coinList.findIndex((coin) => coin.id === actions.payload.id);
            if (idx === -1) {
                return state;
            }
            state.coinList[idx].change = actions.payload.change;
            return state;
        },
        updatePreClose: (state, actions: PayloadAction<Coin>) => {
            const idx = state.coinList.findIndex((coin) => coin.id === actions.payload.id);
            if (idx === -1) {
                return state;
            }
            // console.log("updatePreClose", actions.payload.preClose);
            state.coinList[idx].preClose = actions.payload.preClose;
            return state;
        },
    },
});

export const { initCoinList, updateCoin, updatePrice, updateFavorite, updateChange, updatePreClose } = coinListSlice.actions;

export default coinListSlice.reducer;
