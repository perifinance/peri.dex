import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// import { CHART_DEFAULT_ITEM_COUNT } from "configure/chart";

export type Tooltip = {
    open?: string;
    high?: string;
    low?: string;
    close?: string;
};

type ChartList = {
    symbols: string;
    chartList: Array<any>;
    tooltip: Tooltip;
};

const initialState: ChartList = {
    symbols: "",
    chartList: [],
    tooltip: { open: "0", high: "0", low: "0", close: "0" },
};

export const chartListSlice = createSlice({
    name: "chartList",
    initialState,
    reducers: {
        updateChart: (state, actions: PayloadAction<any>) => {
            if (actions.payload.symbols === state.symbols /* && CHART_DEFAULT_ITEM_COUNT <= state.chartList.length */) {
                let chartList = [...state.chartList];
                chartList[chartList.length - 1] = actions.payload.chartLastData;
                return { ...state, chartList};
            }

            return state;
        },
        addChartData: (state, actions: PayloadAction<any>) => {
			if (actions.payload.symbols === state.symbols) {
				let chartList = [...state.chartList, actions.payload.chartLastData];
            	return { ...state, chartList };
			}

			return state;
        },
        updateTooltip: (state, actions: PayloadAction<Tooltip>) => {
            return { ...state, tooltip: actions.payload };
        },
        setChartBase: (state, actions: PayloadAction<any>) => {
            return { ...state, chartList: actions.payload.chartList, symbols: actions.payload.symbols };
        },
    },
});

export const { addChartData, updateChart, updateTooltip, setChartBase } = chartListSlice.actions;

export default chartListSlice.reducer;
