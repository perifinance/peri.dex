import { configureStore} from "@reduxjs/toolkit";
import reducers from '../reducers';
import {
	persistStore,
	persistReducer,
  } from 'redux-persist'

import storage from 'redux-persist/lib/storage';

const persistConfig  = {
	key: 'app',
	storage: storage,
	whitelist: ['wallet']
}

const persistedReducers = persistReducer(persistConfig, reducers);

/* const bigintToString = (key, value) => 
	typeof value === 'bigint' ? value.toString() : value;

const stringToBigint = (key, value) => 
	typeof value === 'string' && /^(\d+)n$/.test(value) ? BigInt(value.slice(0, -1)) : value; */

export const store = configureStore({
	reducer: persistedReducers,
	middleware: (getDefaultMiddleware) => getDefaultMiddleware({
		serializableCheck: false,
		immutableCheck: false
	}),
	/* devTools: {
		actionSanitizer: (action) => 
			JSON.parse(JSON.stringify(action, bigintToString), stringToBigint),
		stateSanitizer: (state) => 
			JSON.parse(JSON.stringify(state, bigintToString), stringToBigint),
	}, */
});

export let persistor = persistStore(store)

