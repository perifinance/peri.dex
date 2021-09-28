import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import reducers from '../reducers';
import {
	persistStore,
	persistReducer,
  } from 'redux-persist'

import storage from 'redux-persist/lib/storage';

const persistConfig  = {
	key: 'app',
	storage,
	whitelist: ["theme"]
}

const persistedReducers = persistReducer(persistConfig, reducers);

export const store = configureStore({
	reducer: persistedReducers,
	middleware: getDefaultMiddleware({
		serializableCheck: false
	})
});

export let persistor = persistStore(store)

