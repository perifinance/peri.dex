import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NetworkFeeState = {
	gasPrice: bigint
}

const initialState: NetworkFeeState = {
	gasPrice: 0n
}


export const NetworkFeeSlice = createSlice({
	name: 'networkFee',
	initialState,
	reducers: {
		updateNetworkFee(state, actions: PayloadAction<NetworkFeeState>) {
			state.gasPrice = actions.payload.gasPrice;
		},
	},
});

export const { updateNetworkFee } = NetworkFeeSlice.actions;

export default NetworkFeeSlice.reducer;