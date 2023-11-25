import /* React, */ { useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

import Header from "../Header";
import Assets from "pages/Assets";
import Exchange from "pages/Exchange";
import Futures from "pages/Futures";
import Bridge from "pages/Bridge";
import Loading from "components/loading";
// import { setLoading } from "reducers/loading/loading";
import { contracts } from "lib/contract";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "reducers";
import { TESTNET, MAINNET, SUPPORTED_NETWORKS } from "lib/network";
import { updateBridgeStatus } from "reducers/bridge/bridge";

const Main = () => {
    // const { isConnect } = useSelector((state: RootState) => state.wallet);
    const {address, networkId, isConnect} = useSelector((state: RootState) => state.wallet);
    const { obsolete } = useSelector((state: RootState) => state.bridge);
    const dispatch = useDispatch();

    const getInboundings = async () => {
        if (!Object.keys(SUPPORTED_NETWORKS).includes(networkId.toString()) || !isConnect) { return; }

        const contractName = {
            PERI: "BridgeState",
            pUSD: "BridgeStatepUSD",
        };
        try {
            const network = !Object.keys(MAINNET).includes(networkId.toString()) 
                ? !Object.keys(TESTNET).includes(networkId.toString()) 
                ? process.env.REACT_APP_ENV ==="production" 
                ? MAINNET : TESTNET : TESTNET : MAINNET; 
            Object.keys(contractName).forEach(async (key) => {
                if (contracts[contractName[key]] === undefined) { 
                    // console.log('contracts[contractName[key]] === undefined', contracts[contractName[key]]);
                    return; 
                }
                const ids = await contracts[contractName[key]].applicableInboundIds(
                    address
                );

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
                let returnValue = Object.keys(network).reduce((a, b) => ((a[b] = 0n), a), {});

                promiseData.forEach((data) => {
                    if (returnValue[data.srcChainId]) {
                        returnValue[data.srcChainId] = returnValue[data.srcChainId] + data.amount;
                    } else {
                        returnValue[data.srcChainId] = data.amount;
                    }
                });

                dispatch(updateBridgeStatus({ coin:key, total: totalAmount, pendings: returnValue }));

            });
        } catch (e) {
            console.log(e);
        }

    };

    useEffect(() => {
        // console.log('useEffect obsolete', obsolete);
        getInboundings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [obsolete]);

    useEffect(() => {
        if (isNaN(networkId) || networkId === 0 || networkId === undefined) { return; }

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
        <div className="text-sm dark:text-inherent dark:bg-black-900 font-Montserrat font-normal">
            <Loading></Loading>
            <div className="container mx-auto p-3 lg:p-5 min-h-screen space-y-2 lg:space-y-10">
                <Router>
                    <Header></Header>
                    <Switch>
                        <Route path="/assets">
                            <Assets />
                        </Route>
                        <Route path="/exchange">
                            <Exchange />
                        </Route>
                        <Route path="/futures">
                            <Futures />
                        </Route>
                        <Route exact path="/bridge">
                            <Redirect to="/bridge/submit"></Redirect>
                        </Route>
                        <Route exact path="/bridge/submit">
                            <Bridge />
                        </Route>
                        <Route exact path="/bridge/receive">
                            <Bridge />
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

