import { createSlice } from "@reduxjs/toolkit";

export type Loading = {
	loadings: Object;
};

const initialState: Loading = {
	loadings: {
		balance: false,
		// chart: false,
		// order: false,
	},
};

export const loadingSlice = createSlice({
	name: "loading",
	initialState,
	reducers: {
		setLoading: (state, actions) => {
			state.loadings[actions.payload.name] = actions.payload.value;
		},
	},
});

export const { setLoading } = loadingSlice.actions;

export default loadingSlice.reducer;
