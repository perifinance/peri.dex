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
            const newList = state.coinList.map((coin) => {
                if (coin.id === actions.payload.id) {
                    return actions.payload;
                }
                return coin;
            });

            return { ...state, coinList: newList };
        },
        updatePrice: (state, actions: PayloadAction<any>) => {
            let existList = [...state.coinList];
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
    },
});

export const { initCoinList, updateCoin, updatePrice } = coinListSlice.actions;

export default coinListSlice.reducer;
