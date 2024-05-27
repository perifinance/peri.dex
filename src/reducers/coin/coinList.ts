import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Coin = {
    id?: number;
    favorite?: boolean;
    name?: string;
    symbol?: string;
    categories?: Array<string>;
    decimal?: number;
    key?: string;
    price?: number;
    change?: number;
    timestamp?: number;
    isActive?: boolean;
    upDown?: number;
    high?: number;
    low?: number;
    preClose?: number;
};

export type CoinList = {
    coinList: Array<Coin>;
    symbolMap: any;
};

const initialState: CoinList = {
    coinList: Array<Coin>(),
    symbolMap: {
        pUSD: 0,
        pBTC: 1,
    }
}; 

export const coinListSlice = createSlice({
    name: "coinList",
    initialState,
    reducers: {
        initCoinList: (state, action: PayloadAction<Coin[]>) => {
            const coinList = Array<Coin>();
            const symbolMap = {};
            action.payload.forEach((coin, idx )=> {
                symbolMap[coin.symbol] = idx;
                coinList.push(coin);
            });
            // console.log(symbolMap);
            return {coinList, symbolMap};
        },
        updateCoin: (state, action: PayloadAction<Coin>) => {
            const idx = state.symbolMap[action.payload.symbol];
            if (idx === -1) {
                return ;
            }

            const existCoin:Coin = state.coinList[idx];
            // console.log(existCoin.timestamp, action.payload.timestamp);
            if (existCoin.timestamp > action.payload.timestamp || existCoin.price === action.payload.price) {
                return ;
            }
            const change = existCoin.preClose 
                ? (action.payload.price - existCoin.preClose) / existCoin.preClose * 100
                : 0;
            const upDown = existCoin.price === action.payload.price
                ? 0
                : existCoin.price < action.payload.price
                    ? 1
                    : -1;
            const high = action.payload.price > existCoin.high ? action.payload.price : existCoin.high;
            const low = existCoin.low !== 0 && action.payload.price < existCoin.low ? action.payload.price : existCoin.low;
            state.coinList[idx] = {...existCoin, timestamp:action.payload.timestamp, price:action.payload.price
                , high, low, change, upDown};
            /* state.coinList[idx].change = existCoin.preClose 
                ? (action.payload.price - existCoin.preClose) / existCoin.preClose * 100
                : 0;
            state.coinList[idx].upDown = existCoin.price === action.payload.price
                ? 0
                : existCoin.price < action.payload.price
                    ? 1
                    : -1;
            state.coinList[idx].high = action.payload.price > existCoin.high ? action.payload.price : existCoin.high;
            state.coinList[idx].low = existCoin.low !== 0 && action.payload.price < existCoin.low ? action.payload.price : existCoin.low;
            state.coinList[idx].timestamp = action.payload.timestamp;
            state.coinList[idx].price = action.payload.price; */
        },
        updateFavorite: (state, action: PayloadAction<{symbol:string, favorite:boolean}>) => {
            const idx = state.symbolMap[action.payload.symbol];
            if (idx !== -1) {
                state.coinList[idx].favorite = action.payload.favorite;
            }
        },
        updatePreClose: (state, action: PayloadAction<{symbol:string, preClose:number}>) => {
            const idx = state.symbolMap[action.payload.symbol];
            if (idx !== -1) {
                state.coinList[idx].preClose = action.payload.preClose;
            }
        },
    },
});

export const { updateCoin, initCoinList, updateFavorite, updatePreClose } = coinListSlice.actions;

export default coinListSlice.reducer;
