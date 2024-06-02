import { createSlice } from "@reduxjs/toolkit";

type BalanceState = {
    isReady: boolean;
    balances: Object;
};

const initialState: BalanceState = {
    isReady: false,
    balances: {
        DEBT: {
            decimal: 18,
            active: true,
        },
        PERI: {
            decimal: 18,
            active: true,
        },
        pUSD: {
            decimal: 18,
            active: true,
        },
        LP: {
            decimal: 18,
            active: true,
        },
        USDC: {
            decimal: 6,
            active: true,
        },
        DAI: {
            decimal: 18,
            active: true,
        },
    },
};

export const ExchangeRatesSlice = createSlice({
    name: "balances",
    initialState,
    reducers: {
        initCurrency(state, actions) {
            return { ...state, isReady: true, balances: actions.payload };
        },
        updateBalances(state, actions) {
            let balances = { ...state.balances };
            balances[actions.payload.currencyName][actions.payload.value] = actions.payload.balance;

            return { ...state, balances };
        },
        clearBalances(state) {
            let balances = { ...state.balances };
            Object.keys(balances).forEach((e) => {
                Object.keys(balances[e]).forEach((a) => {
                    if (a === "decimal" || a === "active") {
                    } else {
                        balances[e][a] = 0n;
                    }
                });
            });
            return { ...state, balances };
        },
    },
});

export const { initCurrency, updateBalances, clearBalances } = ExchangeRatesSlice.actions;

export default ExchangeRatesSlice.reducer;
