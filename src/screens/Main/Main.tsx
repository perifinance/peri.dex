import React, { useCallback, useEffect, useRef } from "react";
import { /* BrowserRouter as Router, */ Switch, Route, Redirect, useLocation } from "react-router-dom";

import Assets from "pages/Assets";
import { ExchangeTV } from "pages/Exchange";
// import Futures from "pages/Futures";
import Bridge from "pages/Bridge";
// import { setLoading } from "reducers/loading/loading";
import { useContracts } from "lib";
import { useDispatch, useSelector } from "react-redux";
// import { useAppSelector } from "store";
import { RootState } from "reducers";
import { TESTNET, MAINNET, SUPPORTED_NETWORKS } from "lib/network";
import { updateBridgeStatus } from "reducers/bridge/bridge";
import Portfolio from "pages/Portfolio/Portfolio";
import { getBalances } from "lib/thegraph/api";
import { initPynthBalance, /* updatePynthBalances */ } from "reducers/wallet/pynthBlances";
import { PynthBalance } from "reducers/wallet/pynthBlances";
import { setLoading } from "reducers/loading";
import { updateCoin } from "reducers/coin/coinList";
import { subscribeOnStreamByMain } from "lib/datafeed";
import Swap from "pages/swap";
import useInterval from "hooks/useInterval";
import { toNumber } from "lib/bigInt";
// import TradingViewIframeContent from "screens/TradingView/TradingViewIframeContent";
// import Loading from "components/loading";
// import Header from "screens/Header";
// import { setAppReady } from "reducers/app";

const Main = () => {
    // const { isConnect } = useSelector((state: RootState) => state.wallet);
    const { address, networkId, isConnect } = useSelector((state: RootState) => state.wallet);
    const { obsolete } = useSelector((state: RootState) => state.bridge);
    const { isReady } = useSelector((state: RootState) => state.app);
    // const { balancePynths } = useSelector((state: RootState) => state.pynthBlances);
    const { coinList, symbolMap } = useSelector((state: RootState) => state.coinList);
    const { destination } = useSelector((state: RootState) => state.selectedCoin);
    const dispatch = useDispatch();
    const [{ contracts }] = useContracts();
    const location = useLocation();
    const { initInterval, stopInterval } = useInterval();
    // const history = useHistory();

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
                if (contracts || contracts[contractName[key]] === undefined) {
                    // console.log('contracts[contractName[key]] === undefined', contracts[contractName[key]]);
                    return;
                }
                const ids = await contracts[contractName[key]].applicableInboundIds(address);

                let datas = [];
                let totalAmount = 0;
                for (let id of ids) {
                    let inbounding = await contracts[contractName[key]].inboundings(id);
                    // console.log(inbounding);
                    const amount = toNumber(inbounding.amount);
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
                        returnValue[data.srcChainId] = returnValue[data.srcChainId] + toNumber(data.amount);
                    } else {
                        returnValue[data.srcChainId] = toNumber(data.amount);
                    }
                });

                console.log("returnValue", returnValue);

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
            // const keys = data?.id;

            // console.log("updatePrice", symbolMap);
            const idx = symbolMap[`p${keys[0]}`];
            if (!idx || keys[1] !== "USD") {

                // console.log("updatePrice idx not found idx:", idx);
                return;
            }

            // console.log("updatePrice", data);
            const coin = coinList[idx];
            const price = Number(data.p);
            const newCoin = {
                ...coin,
                price,
                timestamp: data.t,
            };
            // console.log("updatePrice", newCoin);
            dispatch(updateCoin(newCoin));

            /* if (destination.symbol === coin.symbol) {
                const lastRateData = {
                    timestamp: data.t,
                    rate: price,
                    symbol: coin.symbol,
                    index: idx,
                };

                // console.log("lastRateData", lastRateData);
                dispatch(updateLastRateData(lastRateData));
            } */
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

            balancePynths.sort((a, b) => b.amount - a.amount);

            console.log("setPynthBalances", balancePynths);

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
        // console.log("setPynthBalances", isReady);
        /* if (balancePynths?.length === 0) { */
            setPynthBalances();
        /* }  */
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setPynthBalances]);

    useEffect(() => {
        // console.log('useEffect obsolete', obsolete);
        getInboundings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [obsolete]);

    useEffect(() => {
        console.log("Main useEffect coinList", location.pathname);
        ["/assets" , "/exchange"].includes(location.pathname) && coinList.length
        ? subscribeOnStreamByMain(updatePrice)
        : subscribeOnStreamByMain(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [coinList.length, destination?.symbol, isConnect, location]);

    useEffect(() => {
        return () => {
            console.log("Main useEffect return");
            subscribeOnStreamByMain(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // console.log("isConnect", isConnect, networkId);
        if (isNaN(networkId) || networkId === 0 || networkId === undefined) {
            return;
        }

        setTimeout(() => {
            getInboundings();
        }, 1000);

        initInterval(() => getInboundings(), 1000 * 60);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnect, networkId]);

    return (
        <Switch>
            {/* <Route path="/tradingview-iframe">
                <TradingViewIframeContent/>
            </Route> */}
            <Route path="/assets">
                <Assets />
            </Route>
            <Route path="/exchange">
                <ExchangeTV />
            </Route>
            <Route path="/swap">
                <Swap/>
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
    );
};
export default Main;
