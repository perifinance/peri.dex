import { combineReducers } from "@reduxjs/toolkit";

import balances from "./wallet/balances";

import theme from "./theme/theme";

import exchangeRates from "./rates/exchangeRates";

import networkFee from "./networkFee/networkFee";

import transaction from "./transaction/transaction";

import loading from "./loading/loading";

import wallet from "./wallet/wallet";
import coinList from "./coin/coinList";
import selectedCoin from "./coin/selectedCoin";
import chart from "./chart/chart";
import app from "./app/app";

const reducers = combineReducers({
	app,
	theme,
	wallet,
	balances,
	exchangeRates,
	networkFee,
	transaction,
	loading,
	coinList,
	selectedCoin,
	chart,
});

export type RootState = ReturnType<typeof reducers>;

export default reducers;

// export default reducer;
