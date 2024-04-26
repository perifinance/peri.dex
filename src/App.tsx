import { useEffect, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NotificationContainer, NotificationManager } from "react-notifications";
// import { getLastRates, getBalances } from 'lib/thegraph/api'
import { RootState } from "reducers";

import { updateAddress, updateNetwork, updateIsConnect, clearWallet } from "reducers/wallet";
// import { clearWallet, clearBalances } from 'reducers/wallet'
import { resetTransaction } from "reducers/transaction";
import { initCoinList } from "reducers/coin/coinList";
import { setSelectedCoin } from "reducers/coin/selectedCoin";
import { setAppReady } from "reducers/app";
// import { changeNetwork } from 'lib/network'

import { web3Onboard } from "lib/onboard/web3Onboard";
import { contracts } from "lib/contract";
import { getCoinList } from "lib/coinList";

import Main from "./screens/Main";
import "./App.css";
import { getRateTickers } from "lib/thegraph/api/getRateTickers";
import { pynthsList } from "configure/coins/pynthsList";
import { end, start } from "lib/peformance";
import { extractMessage } from "lib/error";
import { getBridgeCost } from "lib/bridge/getBridgeCost";
import { setCost } from "reducers/bridge/bridge";
// import { getRateTickers } from "lib/thegraph/api/getRateTickers";

const App = () => {
    const { networkId } = useSelector((state: RootState) => state.wallet);
    const transaction = useSelector((state: RootState) => state.transaction);
    const themeState = useSelector((state: RootState) => state.theme.theme);
    const [rateTickers, setRateTickers] = useState({});

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
                            dispatch(setCost({}));
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
                                contracts.connect(newAddress, setIsAppReady);
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
                            contracts.init(newNetworkId);
                            dispatch(updateNetwork({ networkId: newNetworkId }));
                            getBridgeCost(newNetworkId).then((cost) => {
                                dispatch(setCost(cost));
                            });
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

        // dispatch(setAppReady());
    };

    const setIsAppReady = async () => {
        console.log("setIsAppReady");

        dispatch(setAppReady());
    };

    const getState = useCallback(async () => {
        try {
            await contracts.provider.once(transaction.hash, async (transactionState) => {
                if (transactionState.status !== 1) {
                    NotificationManager.remove(NotificationManager.listNotify[0]);
                    NotificationManager.warning(`${transaction.type} failed`, "ERROR");
                    if (transaction.error) {
                        transaction.error();
                    }
                } else {
                    NotificationManager.remove(NotificationManager.listNotify[0]);
                    NotificationManager.success(`${transaction.type} succeeded`, "SUCCESS");
                    if (transaction.action) {
                        transaction.action();
                    }
                }
                dispatch(resetTransaction());
            });
        } catch (error) {
            NotificationManager.remove(NotificationManager.listNotify[0]);
            NotificationManager.warning(extractMessage(error),`${transaction.type} failed`);
            if (transaction.error) {
                transaction.error();
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
        setRateTickers(getRateTickers());
        // eslint-disable-next-line
    }, []);

    const initializeCoinList = useCallback(async (coinList) => {
        start("initializeCoinList");
        const newPynthsList:any = [...pynthsList];

        const newCoinList:any = await Promise.all(newPynthsList.map((coin) => {
            // const isActive = coinList.findIndex(e => e.symbol === coin.symbol) !== -1;
            const { price, change, timestamp } = rateTickers[coin.symbol] 
                ? rateTickers[coin.symbol] 
                : { price: 0n, change: 0n, timestamp: 0n };
            return {...coin, price, change, timestamp, isActive:false}
        }));

        // console.log("newCoinList", newCoinList);
        // console.log("coinList", coinList);
        coinList.forEach((coin) => newCoinList[newCoinList.findIndex(e => e.symbol === coin.symbol)].isActive = true);
        
        end();
        dispatch(initCoinList(newCoinList));

    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[dispatch]);

    // const init = /* useCallback( */async () => {
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // }/* , [networkId]) */; 

    useEffect(() => {
        if (networkId) {
            try {
                const coinList = getCoinList(networkId);
                if (!coinList) {
                    return;
                }
    
                // console.log("coinList", coinList);
                dispatch(setSelectedCoin({ source: coinList[0], destination: coinList[1] }));
    
                initializeCoinList(coinList);
    
            } catch (e) {
                console.log(e);
            }
        }
    }, [dispatch, initializeCoinList, networkId]);

    return (
        <div>
            {/* <Loading></Loading> */}
            <Main></Main>
            <NotificationContainer />
        </div>
    );
};

export default App;
