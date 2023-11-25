import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { it } from "date-fns/locale";

export type OnSendCoin = {
    destChainId: Number;
    srcChainId: Number;
    coin: string;
};

export type PendingCoin = {
    coin: string;
    total: bigint;
    pendings: any;
};

type BridgingStatus = {
    obsolete: boolean;
    step: Number;
    pendingCoins: Array<PendingCoin>;
    onSendCoins: Array<OnSendCoin>;
};

const initialState: BridgingStatus = {
    obsolete: false,
    step: 0,
    pendingCoins: [],
    onSendCoins: [],
};

export const bridgeState = createSlice({
    name: "bridgeState",
    initialState,
    reducers: {
        updateBridgeStatus: (state, actions: PayloadAction<PendingCoin>) => {
            let pendingCoins = state.pendingCoins.filter((item) => {
                return item.coin !== actions.payload.coin;
            });

            if (actions.payload.total !== BigInt(0)) {
                pendingCoins.push(actions.payload);
            }

            return { ...state, pendingCoins, obsolete: false };
        },
        updateStep: (state, actions: PayloadAction<Number>) => {
            return { ...state, step: actions.payload };
        },
        setObsolete: (state, actions: PayloadAction<boolean>) => {
            return { ...state, obsolete: actions.payload };
        },
        setOnSendCoin: (state, actions: PayloadAction<OnSendCoin>) => {
            let onSendCoins = state.onSendCoins.filter((item) => {
                return item.destChainId !== actions.payload.destChainId && item.coin !== actions.payload.coin;
            });

            if (actions.payload.srcChainId !== 0) {
                onSendCoins.push(actions.payload);
            }
            return { ...state, onSendCoins };
        },
        resetBridgeStatus: (state, actions: PayloadAction<Number>) => {
            const idx = state.onSendCoins.findIndex((item) => {
                return item.destChainId === actions.payload;
            });

            return { ...state, step: idx !== -1 ? 1 : 0, obsolete: true, pendingCoins: [] };
        },
    },
});

export const { setOnSendCoin, setObsolete, updateStep, updateBridgeStatus, resetBridgeStatus } = bridgeState.actions;

export default bridgeState.reducer;
