import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Chart = {
	id?: number;
	favorite?: boolean;
	name?: string;
	symbol?: string;
	categories?: Array<string>;
	decimal?: number;
	balance?: bigint;
};
type ChartList = {
	chartList: Array<any>;
};

const initialState: ChartList = {
	chartList: [],
};

export const chartListSlice = createSlice({
	name: "chartList",
	initialState,
	reducers: {
		updateChart: (state, actions: PayloadAction<any>) => {
			state.chartList = actions.payload;
		},
	},
});

export const { updateChart } = chartListSlice.actions;

export default chartListSlice.reducer;
