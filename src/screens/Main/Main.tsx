import { /* React, */ useCallback, useEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

import Header from "../Header";
import Assets from "pages/Assets";
import { Exchange, ExchangeTV } from "pages/Exchange";
// import Futures from "pages/Futures";
import Bridge from "pages/Bridge";
import Loading from "components/loading";
// import { setLoading } from "reducers/loading/loading";
import { useContracts } from "lib/contract";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "reducers";
import { TESTNET, MAINNET, SUPPORTED_NETWORKS } from "lib/network";
import { updateBridgeStatus } from "reducers/bridge/bridge";
import Portfolio from "pages/Portfolio/Portfolio";
import { getBalances } from "lib/thegraph/api";
import { toBigInt, toNumber } from "lib/bigInt";
import { initPynthBalance, /* updatePynthBalances */ } from "reducers/wallet/pynthBlances";
import { PynthBalance } from "reducers/wallet/pynthBlances";
import { setLoading } from "reducers/loading";
import { updateCoin } from "reducers/coin/coinList";
import { updateLastRateData } from "reducers/rates";
import { subscribeOnStreamByMain } from "lib/datafeed";
import Swap from "pages/swap/Swap";
import { setAppReady } from "reducers/app";

const Main = () => {
    // const { isConnect } = useSelector((state: RootState) => state.wallet);
    const { address, networkId, isConnect } = useSelector((state: RootState) => state.wallet);
    const { obsolete } = useSelector((state: RootState) => state.bridge);
    const { isReady } = useSelector((state: RootState) => state.app);
    // const { balancePynths } = useSelector((state: RootState) => state.pynthBlances);
    const { coinList } = useSelector((state: RootState) => state.coinList);
    const { destination } = useSelector((state: RootState) => state.selectedCoin);
    const dispatch = useDispatch();
    const [{ contracts }] = useContracts();
    const [stopUpdate, setStopUpdate] = useState(false);

    const getInboundings = async () => {
        if (!networkId || !Object.keys(SUPPORTED_NETWORKS).includes(networkId.toString()) || !contracts) {
            return;
        }

        const contractName = {
            PERI: "BridgeState",
            pUSD: "BridgeStatepUSD",
        };
        try {
            const network = !Object.keys(MAINNET).includes(networkId.toString())
                ? !Object.keys(TESTNET).includes(networkId.toString())
                    ? process.env.REACT_APP_ENV === "production"
                        ? MAINNET
                        : TESTNET
                    : TESTNET
                : MAINNET;
            Object.keys(contractName).forEach(async (key) => {
                if (contracts[contractName[key]] === undefined) {
                    // console.log('contracts[contractName[key]] === undefined', contracts[contractName[key]]);
                    return;
                }
                const ids = await contracts[contractName[key]].applicableInboundIds(address);

                let datas = [];
                let totalAmount = 0n;
                for (let id of ids) {
                    let inbounding = await contracts[contractName[key]].inboundings(id);
                    // console.log(inbounding);
                    const amount = BigInt(inbounding.amount);
                    totalAmount = totalAmount + amount;
                    datas.push({
                        amount,
                        srcChainId: inbounding.srcChainId.toString(),
                    });
                }
                let promiseData = await Promise.all(datas);
                // eslint-disable-next-line no-sequences
                let returnValue = Object.keys(network).reduce((a, b) => ((a[b] = 0n), a), {});

                promiseData.forEach((data) => {
                    if (returnValue[data.srcChainId]) {
                        returnValue[data.srcChainId] = returnValue[data.srcChainId] + data.amount;
                    } else {
                        returnValue[data.srcChainId] = data.amount;
                    }
                });

                dispatch(updateBridgeStatus({ coin: key, total: totalAmount, pendings: returnValue }));
            });
        } catch (e) {
            console.log(e);
        }
    };

    const updatePrice = (data) => {
        if (coinList.length === 0) return;

        try {
            const keys = data?.id?.split(".")[1].split("/");

            const idxFind = coinList.findIndex((e) => e.key === keys[0]);
            if (idxFind === -1 || keys[1] !== "USD"/*  || !coinList[idxFind]?.timestamp */) {
                // console.log("updatePrice", idxFind, keys, coinList[idxFind]);
                return;
            }

            // console.log("updatePrice", data);
            const bnPrice = toBigInt(data.p);
            const newCoin = {
                ...coinList[idxFind],
                price: bnPrice,
                timestamp: data.t,
            };
            dispatch(updateCoin(newCoin));

            if (isConnect && destination.symbol === coinList[idxFind].symbol) {
                const lastRateData = {
                    timestamp: data.t,
                    rate: bnPrice,
                    symbols: data?.id?.split(".")[1],
                    index: idxFind,
                };

                // console.log("lastRateData", lastRateData);
                dispatch(updateLastRateData(lastRateData));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const setPynthBalances = useCallback(async () => {
        console.log("setPynthBalances", isReady, networkId, address);
        // console.log("window.location.href", window.location.href);
        
        if (!isReady) return;

        const isPortFolio = window.location.href.includes("assets") || window.location.href.includes("portfolio");

        if (isPortFolio) {
            dispatch(setLoading({ name: "balance", value: true }));
        }

        try {
            // let rates = await getLastRates({ currencyName: govCoin[networkId] });
            let balancePynths = (await getBalances({ networkId, address })) as Array<PynthBalance>;

            balancePynths.sort((a, b) => toNumber(b.amount - a.amount));

            // console.log("balancePynths", balancePynths);

            dispatch(initPynthBalance({ balancePynths }));
        } catch (e) {
            console.error("init error", e);
        }

        if (isPortFolio) {
            dispatch(setLoading({ name: "balance", value: false }));
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [networkId, address, isReady]);

    useEffect(() => {
        console.log("setPynthBalances", isReady);
        /* if (balancePynths?.length === 0) { */
            setPynthBalances();
        /* }  */
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setPynthBalances]);

    useEffect(() => {
        console.log('useEffect obsolete', obsolete);
        getInboundings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [obsolete]);

    useEffect(() => {
        console.log("coinList", coinList, isConnect);
        !stopUpdate 
            ? coinList.length && subscribeOnStreamByMain(updatePrice)
            : subscribeOnStreamByMain(null);
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [coinList.length, destination?.symbol, isConnect, stopUpdate]);

    useEffect(() => {
        console.log("isConnect", isConnect, networkId);
        if (isNaN(networkId) || networkId === 0 || networkId === undefined) {
            return;
        }

        const timeout = setTimeout(() => {
            getInboundings();
        }, 1000);

        const setIntervals = setInterval(() => {
            getInboundings();
        }, 1000 * 60);

        if (!isConnect) {
            clearTimeout(timeout);
            clearInterval(setIntervals);
        }

        return () => clearInterval(setIntervals);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnect, networkId]);

    return (
        <div className="flex flex-col text-sm w-screen h-fit lg:h-screen dark:text-inherent dark:bg-inherit font-Montserrat font-normal">
            <Loading></Loading>
            <div className="flex flex-col items-center w-full h-full lg:mx-auto p-3 lg:p-5 min-h-screen space-y-1 ">
                <Router>
                    <Header></Header>
                    <Switch>
                        <Route path="/assets">
                            <Assets />
                        </Route>
                        <Route path="/exchange">
                            <ExchangeTV />
                        </Route>
                        <Route path="/swap">
                            <Swap setStopUpdate={setStopUpdate}/>
                        </Route>
                        <Route exact path="/bridge">
                            <Redirect to="/bridge/submit"></Redirect>
                        </Route>
                        <Route exact path="/bridge/submit">
                            <Bridge />
                        </Route>
                        <Route exact path="/portfolio">
                            <Portfolio />
                        </Route>

                        <Route path="/">
                            <Redirect to="/exchange"></Redirect>
                        </Route>
                    </Switch>
                </Router>
            </div>
        </div>
    );
};
export default Main;
