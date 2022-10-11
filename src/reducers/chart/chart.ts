import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Tooltip = {
	open?: string;
	high?: string;
	low?: string;
	close?: string;
};

type ChartList = {
	chartList: Array<any>;
	tooltip: Tooltip;
};

const initialState: ChartList = {
	chartList: [],
	tooltip: { open: "0", high: "0", low: "0", close: "0" },
};

export const chartListSlice = createSlice({
	name: "chartList",
	initialState,
	reducers: {
		updateChart: (state, actions: PayloadAction<any>) => {
			state.chartList = actions.payload;
		},
		updateTooltip: (state, actions: PayloadAction<Tooltip>) => {
			state.tooltip = actions.payload;
		},
	},
});

export const { updateChart, updateTooltip } = chartListSlice.actions;

export default chartListSlice.reducer;
