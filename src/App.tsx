import React, { useEffect, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Route, BrowserRouter as Router } from "react-router-dom";
import { providers } from "ethers";
import { NotificationContainer, NotificationManager } from "react-notifications";
import { RootState } from "reducers";
import Loading from "components/loading";
import { updateAddress, updateNetwork, updateIsConnect, clearWallet } from "reducers/wallet";
import { resetTransaction } from "reducers/transaction";
import { Coin, initCoinList } from "reducers/coin/coinList";
import { setSelectedCoin } from "reducers/coin/selectedCoin";
import { setAppReady } from "reducers/app";
import { useContracts } from "lib/contract";
import { getCoinList } from "lib/coinList";
import { getRateTickers } from "lib/thegraph/api/getRateTickers";
import { pynthsList } from "configure/coins/pynthsList";
import { extractMessage } from "lib/error";
import { useWallets, useConnectWallet } from "lib/onboard";
import { getBridgeCost } from "lib/bridge/getBridgeCost";
import { setCost } from "reducers/bridge/bridge";

import Header from "screens/Header";
import Main from "./screens/Main";
import 'react-notifications/lib/notifications.css';
import "css/App.css";

const App = () => {
    const { networkId } = useSelector((state: RootState) => state.wallet);
    const transaction = useSelector((state: RootState) => state.transaction);
    const themeState = useSelector((state: RootState) => state.theme.theme);
    const { coinList } = useSelector((state: RootState) => state.coinList);
    const { isReady } = useSelector((state: RootState) => state.app);
    const [rateTickers, setRateTickers] = useState({});

    const [{ wallet }, connect, disconnectWallet] = useConnectWallet();
    const connectedWallets = useWallets();
    const [{ contracts, IsContractsReady }, initContracts, connectContracts, clearContracts] = useContracts();

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
        /* try {
            web3Onboard.init(
                {
                    wallet: async (wallet) => {
                        if (wallet?.provider !== undefined) {
                            // contracts.wallet = wallet;
                            localStorage.setItem("selectedWallet", wallet.label);
                            dispatch(setCost({}));
                        } else {
                            contracts.clear();
                        }
                    },
                    address: async (provider, newAddress) => {
                        // console.log('contract connect call in address', newAddress);

                        try {
                            if (newAddress === undefined) {
                                contracts.clear();
                                dispatch(clearWallet());
                                dispatch(updateAddress({ address: null }));
                            } else {
                                contracts.connect(provider, newAddress);
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
        } */
        const selectedWallet = localStorage.getItem("selectedWallet");

        if (selectedWallet) {
            try {
                await connect({ autoSelect: { label: selectedWallet, disableModals: true } });
                // await web3Onboard.connect(selectedWallet);
            } catch (e) {
                console.log(e);
            }
        }

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
            NotificationManager.warning(extractMessage(error), `${transaction.type} failed`);
            if (transaction.error) {
                transaction.error();
            }
            console.log(error);
        }
    }, [transaction, dispatch]);

    useEffect(() => {
        console.log("IsContractsReady", IsContractsReady);
        IsContractsReady && dispatch(setAppReady(true));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [IsContractsReady]);

    useEffect(() => {
        console.log("wallet", wallet);
        if (wallet) {
            localStorage.setItem("selectedWallet", wallet.label);
            // dispatch(setAppReady());
            // console.log("wallet.accounts[0].address", wallet.accounts[0].address);
            dispatch(updateAddress({ address: wallet.accounts[0].address }));

            const wProvider = new providers.Web3Provider(wallet.provider, "any");
            wProvider?.getNetwork().then((res: any) => {
                console.log("networkId", res.chainId);
                // if (networkId === res.chainId) return;
                dispatch(updateNetwork({ networkId: res.chainId }));
                initContracts(res.chainId).then(() => connectContracts(wallet.provider, wallet.accounts[0].address));
            });
        } else {
            dispatch(clearWallet());
            clearContracts();
            dispatch(setAppReady(false));
            console.log("wallet clear");
            // dispatch(updateIsConnect(false));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wallet]);


    useEffect(() => {
        console.log("connectedWallets", connectedWallets);
        if (connectedWallets.length) {
            const connectedWalletsLabelArray = connectedWallets.map(({ label }) => label);
            localStorage.setItem("connectedWallets", JSON.stringify(connectedWalletsLabelArray));
            dispatch(updateIsConnect(true));
        } else {
            dispatch(clearWallet());
            clearContracts();
            console.log("connectedWallets clear");
            // clearContracts();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connectedWallets]);

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
        dispatch(setSelectedCoin({ source: {...pynthsList[0], index:0}, destination: {...pynthsList[1], index:1} }));

        return () => {
            disconnectWallet(wallet);
            clearContracts();
            dispatch(clearWallet());
        };
        // eslint-disable-next-line
    }, []);

    const initializeCoinList = async () => {
        // start("initializeCoinList");
        // const newPynthsList:any = [...pynthsList];

        const newCoinList = await Promise.all(coinList.map((e, ) => {
            // console.log("e", e);
            const coin = rateTickers[e.symbol];
            if (coin) {
                return {
                    ...e, price:coin.price, high:coin.price, low:coin.low, timestamp:coin.timestamp, preClose:coin.preClose 
                } as Coin;
            } else {
                return {...e, price: 0, high: 0, low: 0, timestamp: 0, preClose: 0 } as Coin;
            }
        }));
        console.log("newCoinList", newCoinList);

        // end();
        dispatch(initCoinList(newCoinList));
    };

    useEffect(() => {
        // console.log("rateTickers : ", Object.keys(rateTickers).length);
        if (Object.keys(rateTickers).length === 0) return;
        try {
            initializeCoinList();
        } catch (e) {
            console.log(e);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rateTickers]);

    useEffect(() => {
        // if (pynthsList.length !== coinList.length) return;
        console.log("networkId : ", networkId);

        // start("setCoinList");
        const netCoinList: any = getCoinList(networkId, coinList);
        if (!netCoinList) {
            return;
        }

        dispatch(initCoinList(netCoinList));
        // end();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [networkId]);

    return (
        <div className="flex flex-col text-sm w-screen h-fit lg:h-screen dark:text-inherent dark:bg-inherit font-Montserrat font-normal">
            <Loading></Loading>
            <div className="flex flex-col items-center w-full h-full lg:mx-auto p-3 lg:p-5 min-h-screen space-y-1 ">
                <Router>
                    <div className={`items-center w-full ${window.location.href.includes("iframe")? "hidden": "flex"}`}>
                    <Header />
                    </div>
                    <Main/>
                </Router>
            </div>
            <NotificationContainer />
        </div>
    );
};

export default App;
