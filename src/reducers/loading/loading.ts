import { createSlice } from "@reduxjs/toolkit";

export type Loading = {
    loadings: Object;
};

const initialState: Loading = {
    loadings: {
        balance: false,
        chart: false,
        // order: false,
    },
};

export const loadingSlice = createSlice({
    name: "loading",
    initialState,
    reducers: {
        setLoading: (state, actions) => {
            let loadings = { ...state.loadings };
            loadings[actions.payload.name] = actions.payload.value;

            return { ...state, loadings };
        },
    },
});

export const { setLoading } = loadingSlice.actions;

export default loadingSlice.reducer;
