import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type TransactionState = {
    hash: string;
    message: string;
    type: string;
    action: () => void;
    error: () => void;
};

const initialState: TransactionState = {
    hash: undefined,
    message: undefined,
    type: undefined,
    action: undefined,
    error: undefined,
};

export const TransactionSlice = createSlice({
    name: "transaction",
    initialState,
    reducers: {
        resetTransaction(state) {
            return {
                ...state,
                hash: undefined,
                message: undefined,
                type: undefined,
                action: undefined,
                error: undefined,
            };
        },
        updateTransaction(state, actions: PayloadAction<TransactionState>) {
            return {
                ...state,
                hash: actions.payload.hash,
                message: actions.payload.message,
                type: actions.payload.type,
                action: actions.payload.action,
                error: actions.payload.error,
            };
        },
    },
});

export const { resetTransaction, updateTransaction } = TransactionSlice.actions;

export default TransactionSlice.reducer;
