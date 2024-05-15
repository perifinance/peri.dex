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
import { tr } from "date-fns/locale";
// import { getRateTickers } from "lib/thegraph/api/getRateTickers";

const App = () => {
    const { networkId } = useSelector((state: RootState) => state.wallet);
    const transaction = useSelector((state: RootState) => state.transaction);
    const themeState = useSelector((state: RootState) => state.theme.theme);
    const { coinList } = useSelector((state: RootState) => state.coinList);
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
        // console.log("setIsAppReady");

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

        getRateTickers().then((rateTickers) => setRateTickers(rateTickers));
        const coinList = getCoinList(networkId);

        // console.log("getCoinList", coinList);
        const newPynthsList:any = [...pynthsList];
        Promise.all(newPynthsList.map((coin) => {
            if (!coinList) {
                return {...coin, isActive: true};
            }
            try {
                const idxFind = coinList.findIndex(e => e.symbol === coin.symbol);
                if (idxFind !== -1) {
                    return {...coin, isActive: true, favorite: coinList[idxFind].favorite};
                }
            } catch (e) {
                console.log(e);
            }
            return {...coin, isActive: false}
        })).then((newCoinList) => {
            dispatch(initCoinList(newCoinList as any));
            // console.log("initCoinList", newCoinList);
        });
        
        // eslint-disable-next-line
    }, []);

    const initializeCoinList = async () => {
        // start("initializeCoinList");
        // const newPynthsList:any = [...pynthsList];

        const newCoinList:any = await Promise.all(coinList.map((coin) => {
            // const isActive = netCoinList.findIndex(e => e.symbol === coin.symbol) !== -1;
            const { price, change, timestamp, preClose } = rateTickers[coin.symbol] 
                ? rateTickers[coin.symbol] 
                : { price: 0n, change: 0n, timestamp: 0n, preClose: 0n};
            return {...coin, price, change, timestamp, preClose}
        }));
        // console.log("newCoinList", newCoinList);

        // end();
        dispatch(initCoinList(newCoinList));
    };

    useEffect(() => {
        // console.log("rateTickers : ", Object.keys(rateTickers).length);
        if (Object.keys(rateTickers).length === 0) return;
        try {
            /* const coinList = getCoinList(networkId);
            if (!coinList) {
                return;
            } */

            initializeCoinList();

        } catch (e) {
            console.log(e);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rateTickers]);

    useEffect(() => {
        if (pynthsList.length !== coinList.length ) return;

        start("setCoinList");
        const netCoinList = getCoinList(networkId);
        if (!netCoinList) {
            return;
        }

        dispatch(setSelectedCoin({ source: coinList[0], destination: coinList[1] }));

        const newCoinList:any = coinList.map((coin, idx) => {
            const idxFind = netCoinList.findIndex(e => e.symbol === coin.symbol);

            const isActive = idxFind !== -1;
            const favorite = idxFind !== -1 ? netCoinList[idxFind].favorite : false;

            return {...coinList[idx], favorite, isActive};
        });

        dispatch(initCoinList(newCoinList));
        end();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [networkId]);

    return (
        <div>
            {/* <Loading></Loading> */}
            <Main></Main>
            <NotificationContainer />
        </div>
    );
};

export default App;
