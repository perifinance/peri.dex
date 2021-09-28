import { createSlice } from '@reduxjs/toolkit';

type BalanceState = {
	isReady: boolean;
    balances: Object,
}

const initialState: BalanceState = {
	isReady: false,
    balances: {
		DEBT: {
			decimal: 18,
			active: true
		},
		PERI: {
			decimal: 18,
			active: true,
		},
		pUSD: {
			decimal: 18,
			active: true
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
		}
	}
}


export const ExchangeRatesSlice = createSlice({
	name: 'exchangeRates',
	initialState,
	reducers: {
		initCurrecy(state, actions) {
			state.isReady = true;
			state.balances = actions.payload;
		},
		updateBalances(state, actions) {
			state.balances[actions.payload.currencyName][actions.payload.value] = actions.payload.balance;
		},
		clearBalances(state) {
			Object.keys(state.balances).forEach(e => {
				Object.keys(state.balances[e]).forEach(a => {
					if(a === 'decimal' || a === 'active') {
						
					} else {
						state.balances[e][a] = 0n;
					}
					
				})
			});
		}
	},
});

export const { initCurrecy, updateBalances, clearBalances } = ExchangeRatesSlice.actions;

export default ExchangeRatesSlice.reducer;