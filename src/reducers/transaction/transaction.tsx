import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TransactionState = {
	hash: string,
	message: string,
	type: string,
	action: () => void
	error: () => void
}

const initialState: TransactionState = {
	hash: undefined,
	message: undefined,
	type: undefined,
	action: undefined,
	error: undefined
}

export const TransactionSlice = createSlice({
	name: 'transaction',
	initialState,
	reducers: {
		resetTransaction(state) {
			state.hash = undefined;
			state.message = undefined;
			state.type = undefined;
			state.action = undefined;
			state.error = undefined;
		},
		updateTransaction(state,  actions: PayloadAction<TransactionState>) {
			state.hash = actions.payload.hash;
			state.message = actions.payload.message;
			state.type = actions.payload.type;
			state.action = actions.payload.action;
			state.error = actions.payload.error;
		},
	},
});

export const { resetTransaction, updateTransaction } = TransactionSlice.actions;

export default TransactionSlice.reducer;
