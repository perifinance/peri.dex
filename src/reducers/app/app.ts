import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export type AppSliceState = {
	isReady: boolean;
};

const initialState: AppSliceState = {
	isReady: false,
};

const sliceName = 'app';

export const appSlice = createSlice({
	name: sliceName,
	initialState,
	reducers: {
		setAppReady(state, actions: PayloadAction<boolean>) {
			return {...state, isReady: actions.payload};
		},
	},
});

export const {
	setAppReady,
} = appSlice.actions;

export default appSlice.reducer;
