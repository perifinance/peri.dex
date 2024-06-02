import { combineReducers } from "@reduxjs/toolkit";

// import balances from "./wallet/balances";
import pynthBlances from "./wallet/pynthBlances";

import theme from "./theme/theme";

import exchangeRates from "./rates/exchangeRates";

// import networkFee from "./networkFee/networkFee";

import transaction from "./transaction/transaction";

import loading from "./loading/loading";

import wallet from "./wallet/wallet";
import coinList from "./coin/coinList";
import selectedCoin from "./coin/selectedCoin";
import chart from "./chart/chart";
import app from "./app/app";
import bridge from "./bridge/bridge";

const reducers = combineReducers({
	app,
	theme,
	wallet,
	// balances,
	pynthBlances,
	exchangeRates,
	// networkFee,
	transaction,
	loading,
	coinList,
	selectedCoin,
	chart,
	bridge,
});

export type RootState = ReturnType<typeof reducers>;

export default reducers;

// export default reducer;
