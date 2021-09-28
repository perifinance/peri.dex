import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Theme = "dark" | "lite";

export type ThemeState = {
	theme: Theme,
}

const initialState: ThemeState = {
	theme: 'dark',
}


export const ThemeSlice = createSlice({
	name: 'ui',
	initialState,
	reducers: {
		updateTheme(state,  actions: PayloadAction<Theme>) {
			state.theme = actions.payload;
		},
	},
});

export const { updateTheme } = ThemeSlice.actions;

export default ThemeSlice.reducer;
