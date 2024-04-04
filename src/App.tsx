import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NotificationContainer, NotificationManager } from "react-notifications";
// import { getLastRates, getBalances } from 'lib/thegraph/api'
import { RootState } from "reducers";

import { updateAddress, updateNetwork, updateIsConnect, clearWallet } from "reducers/wallet";
// import { clearWallet, clearBalances } from 'reducers/wallet'
import { resetTransaction } from "reducers/transaction";
import { initCoinList, updateCoin } from "reducers/coin/coinList";
import { setSelectedCoin } from "reducers/coin/selectedCoin";
import { setAppReady } from "reducers/app";
// import { changeNetwork } from 'lib/network'

import { web3Onboard } from "lib/onboard/web3Onboard";
import { contracts } from "lib/contract";
import { getCoinList } from "lib/coinList";

import Main from "./screens/Main";
import "./App.css";
import { getRateTickers } from "lib/thegraph/api/getRateTickers";
// import { getRateTickers } from "lib/thegraph/api/getRateTickers";

const App = () => {
    const { networkId } = useSelector((state: RootState) => state.wallet);
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

                        try {
                            await contracts.init(newNetworkId);
                            dispatch(updateNetwork({ networkId: newNetworkId }));
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
                    if (transaction.error) {
                        await transaction.error();
                    }
                } else {
                    NotificationManager.remove(NotificationManager.listNotify[0]);
                    NotificationManager.success(`${transaction.type} succeeded`, "SUCCESS");
                    if (transaction.action) {
                        await transaction.action();
                    }
                }
                dispatch(resetTransaction());
            });
        } catch (error) {
            NotificationManager.remove(NotificationManager.listNotify[0]);
            NotificationManager.error(
                `${transaction.type} failed Code[${
                    error?.error ? (error.error.code ? error.error.code : error.error) : error
                }]`,
                "ERROR"
            );
            if (transaction.error) {
                await transaction.error();
            }
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

    const initializeCoinList = async (coinList) => {
        const rateTickers = await getRateTickers();
        const newCoinList = coinList.map((coin) => ({...coin, price:rateTickers[coin.symbol]?.price, change: rateTickers[coin.symbol]?.change}));
        
        dispatch(initCoinList(newCoinList));

        // console.log("rateTickers", rateTickers);
    };

    const init = useCallback(async () => {
        try {
            const coinList = getCoinList(networkId);
            dispatch(setSelectedCoin({ source: coinList[0], destination: coinList[1] }));

            initializeCoinList(coinList);

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
