import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type NetworkFeeState = {
    gasPrice: number;
};

const initialState: NetworkFeeState = {
    gasPrice: 0,
};

export const NetworkFeeSlice = createSlice({
    name: "networkFee",
    initialState,
    reducers: {
        updateNetworkFee(state, actions: PayloadAction<NetworkFeeState>) {
            return { ...state, gasPrice: actions.payload.gasPrice };
        },
    },
});

export const { updateNetworkFee } = NetworkFeeSlice.actions;

export default NetworkFeeSlice.reducer;
