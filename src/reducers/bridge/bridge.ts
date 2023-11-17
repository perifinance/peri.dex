import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { it } from "date-fns/locale";

export type Pending = {
    srcChainId: Number;
    amount: bigint;
};

export type PendingCoin = {
    coin: string;
    total: bigint;
    pendings: Array<Pending>;
};

type BridgingStatus = {
    obsolete: boolean;
    step: Number;
    pendingCoins: Array<PendingCoin>;
    isBridging: boolean;
};

const initialState: BridgingStatus = {
    obsolete: false,
    step: 0,
    pendingCoins: [],
    isBridging: false,
};

export const bridgeState = createSlice({
    name: "bridgeState",
    initialState,
    reducers: {
        updateBridgeStatus: (state, actions: PayloadAction<PendingCoin>) => {
            state.pendingCoins = state.pendingCoins.filter((item) => {
                return item.coin !== actions.payload.coin;
            });

            if (actions.payload.total !== BigInt(0)) {
                state.pendingCoins.push(actions.payload);
            }

            state.obsolete = false;
        },
        updateStep: (state, actions: PayloadAction<Number>) => {
            state.step = actions.payload;
        },
        setObsolete: (state, actions: PayloadAction<boolean>) => {
            state.obsolete = actions.payload;
        },
        setBridging: (state) => {
            state.isBridging = true;
        }, 
        resetBridgeStatus: (state) => {
            state.obsolete = true;
            state.step = state.isBridging?1:0;
            state.pendingCoins = []; 
            state.isBridging = false;
        }
    },
});

export const { setBridging, setObsolete, updateStep, updateBridgeStatus, resetBridgeStatus } = bridgeState.actions;

export default bridgeState.reducer;
