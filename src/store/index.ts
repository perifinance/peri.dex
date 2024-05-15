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
	whitelist: ["theme", "wallet"]
}

const persistedReducers = persistReducer(persistConfig, reducers);

export const store = configureStore({
	reducer: persistedReducers,
	middleware: (getDefaultMiddleware) => getDefaultMiddleware({
		serializableCheck: false,
		immutableCheck: false
	})
});

export let persistor = persistStore(store)

