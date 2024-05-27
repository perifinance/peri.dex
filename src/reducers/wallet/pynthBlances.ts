import { createSlice, PayloadAction } from "@reduxjs/toolkit";


export type PynthBalance = {
    currencyName: string;
    amount: number;
    balanceToUSD: number;
};

export type PynthPrice = {
	currencyName: string;
	value: number;
};

type PynthBalances = {
    balancePynths: Array<PynthBalance>;
};

const initialState: PynthBalances = {
    balancePynths: [] as Array<PynthBalance>,
};

export const PynthsBlanceSlice = createSlice({
    name: "pynthssBalances",
    initialState,
    reducers: {
        initPynthBalance(state, actions: PayloadAction<PynthBalances>) {
            const balancePynths = [].concat(actions.payload.balancePynths);
            return { balancePynths };
        },
        updatePynthBalances(state, actions: PayloadAction<PynthBalance>) {
			const idx = state.balancePynths.findIndex((balancePynth) => balancePynth.currencyName === actions.payload.currencyName);
			if (idx === -1) {
				return ;
			}

			state.balancePynths[idx] = actions.payload;
        },
        updateUSDValue(state , actions: PayloadAction<PynthPrice>) {
			const idx = state.balancePynths.findIndex((balancePynth) => balancePynth.currencyName === actions.payload.currencyName);
			if (idx === -1) {
				return;
			}

			state.balancePynths[idx].balanceToUSD = state.balancePynths[idx].amount * actions.payload.value;
        },
    },
});

export const { initPynthBalance, updatePynthBalances, updateUSDValue } = PynthsBlanceSlice.actions;

export default PynthsBlanceSlice.reducer;
