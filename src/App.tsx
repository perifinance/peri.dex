import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NotificationContainer, NotificationManager } from "react-notifications";
// import { getLastRates, getBalances } from 'lib/thegraph/api'
import { RootState } from "reducers";

import { updateAddress, updateNetwork, updateIsConnect, clearWallet } from "reducers/wallet";
// import { clearWallet, clearBalances } from 'reducers/wallet'
import { resetTransaction } from "reducers/transaction";
import { initCoinList } from "reducers/coin/coinList";
import { setSourceCoin, setDestinationCoin } from "reducers/coin/selectedCoin";
import { setAppReady } from "reducers/app";
// import { changeNetwork } from 'lib/network'

import { web3Onboard } from "lib/onboard/web3Onboard";
import { contracts } from "lib/contract";
import { getCoinList } from "lib/coinList";

import Main from "./screens/Main";
import "./App.css";

const App = () => {
    const { isConnect, networkId } = useSelector((state: RootState) => state.wallet);
    const transaction = useSelector((state: RootState) => state.transaction);
    const themeState = useSelector((state: RootState) => state.theme.theme);

    const dispatch = useDispatch();

    const setOnboard = async () => {
        // let networkId = Number(process.env.REACT_APP_DEFAULT_NETWORK_ID);
        // try {
        //     // @ts-ignore
        //     networkId = Number((await detectEthereumProvider()).networkVersion);
        // } catch (e) {}

        // console.log('setOnboard', networkId);
        // let netkId = Number(process.env.REACT_APP_DEFAULT_NETWORK_ID);

        // contracts.init(networkId);
        
        // dispatch(updateNetwork({ networkId: networkId }));
        try {
            web3Onboard.init(
                {
                    wallet: async (wallet) => {
                        if (wallet?.provider !== undefined) {
                            contracts.wallet = wallet;
                            localStorage.setItem("selectedWallet", wallet.label);
                        } else {
                            contracts.clear();
                        }
                    },
                    address: async (newAddress) => {

                        // console.log('contract connect call in address', newAddress);
                        
                        try {
                            if (newAddress === undefined) {
                                contracts.clear();
                                dispatch(clearWallet());
                                dispatch(updateAddress({ address: null }));
                            } else {
                                await contracts.connect(newAddress);
                                dispatch(updateIsConnect(true));
                                dispatch(updateAddress({ address: newAddress }));
                            }
                        } catch (err) {
                            console.log(err);
                        }
                    },
                    network: async (network) => {
                        const newNetworkId = Number(network);

                        // console.log('contract init call in network', networkId, newNetworkId);

                        try{
                            await contracts.init(newNetworkId);
                            dispatch(updateNetwork({ networkId: newNetworkId}));
                        } catch (e) {
                            console.log(e);
                        }
                    },
                },
                themeState,
                false
            );
        } catch (e) {
            console.log(e);
            localStorage.clear();
            // window.location.reload()
        }
        const selectedWallet = localStorage.getItem("selectedWallet");

        if (selectedWallet) {
            try {
                await web3Onboard.connect(selectedWallet);
                
            } catch (e) {
                console.log(e);
            }
        }

        dispatch(setAppReady());
    };

    const getState = useCallback(async () => {
        try {
            await contracts.provider.once(transaction.hash, async (transactionState) => {
                if (transactionState.status !== 1) {
                    NotificationManager.remove(NotificationManager.listNotify[0]);
                    NotificationManager.error(`${transaction.type} failed`, "ERROR");
                } else {
                    NotificationManager.remove(NotificationManager.listNotify[0]);
                    NotificationManager.success(`${transaction.type} succeeded`, "SUCCESS");
                    if (transaction.action) {
                        await transaction.action();
                    }
                    dispatch(resetTransaction());
                }
            });
        } catch (error) {
            console.log(error);
        }
        
    }, [transaction, dispatch]);

    useEffect(() => {
        if (transaction.hash) {
            getState();
            NotificationManager.info(transaction.message, "In progress", 1000000);
        }
    }, [getState, transaction]);

    useEffect(() => {
        setOnboard();

        if (themeState === "dark") {
            document.getElementsByTagName("html")[0].classList.add("dark");
        }
        // eslint-disable-next-line
    }, []);

    const init = useCallback(() => {
        console.log('init', networkId);
        try {
            const coinList = getCoinList(networkId);
            dispatch(initCoinList(coinList));
            dispatch(setSourceCoin(coinList[0]));
            dispatch(setDestinationCoin(coinList[1]));
        } catch (e) {}
    }, [networkId, dispatch]);

    useEffect(() => {
        if (networkId) {
            init();
        }
    }, [init, networkId]);

    return (
        <div>
            {/* <Loading></Loading> */}
            <Main></Main>
            <NotificationContainer />
        </div>
    );
};

export default App;
