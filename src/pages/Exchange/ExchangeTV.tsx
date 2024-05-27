import { /* useCallback, */ useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "reducers";
import { NotificationManager } from "react-notifications";

import Order from "screens/Order";
import CoinList from "screens/CoinList";
import OrderHistories from "screens/OrderHistories";
import { setSourceCoin, setDestinationCoin } from "reducers/coin/selectedCoin";
// import { setLoading } from "reducers/loading";
// import { changeNetwork } from "lib/network";
import { networkInfo } from "configure/networkInfo";
import { isExchageNetwork } from "lib/network";
// import { getRateTickers } from "lib/thegraph/api/getRateTickers";
import { /* updateChange, */ updatePreClose } from "reducers/coin/coinList";
import TradingViewWidget from "screens/TradingView/TradingViewWidget";
import { useMediaQuery } from "react-responsive";
// import { getPreCloses/* , getSymbolTicker */ } from "lib/pyth";
import { getRatePreCloses } from "lib/thegraph/api/getRateTickers";
import useInterval from "hooks/useInterval";
// import { updateLastRateData } from "reducers/rates";
// import { toNumber } from "lib/bigInt";

const ExchangeTV = () => {
    const dispatch = useDispatch();
    const { networkId, isConnect } = useSelector((state: RootState) => state.wallet);
    // const { lastRateData } = useSelector((state: RootState) => state.exchangeRates);
    const { coinList, symbolMap } = useSelector((state: RootState) => state.coinList);
    const { destination } = useSelector((state: RootState) => state.selectedCoin);
    const [isCoinList, setIsCoinList] = useState(false);
    const [coinListType, setCoinListType] = useState("destination");
    const [balance, setBalance] = useState([0n, 0n]);
    const [isHide, setIsHide] = useState(true);
    const [isBuy, setIsBuy] = useState(true);
    const isNotWideDevice = useMediaQuery({ query: `(max-width: 1280px)` });
    // const [timeInterval, setTimeInterval] = useState(null);
    const { initInterval, stopInterval } = useInterval();

    const openCoinList = (type) => {
        if (!isConnect) {
            NotificationManager.info(`Please connect your wallet`);
            return false;
        }

        // console.log("openCoinList networkId", networkId);

        if (!isExchageNetwork(networkId)) {
            NotificationManager.warning(
                `You're connected to a supported network. Please change to ${
                    networkInfo[process.env.REACT_APP_DEFAULT_NETWORK_ID].chainName
                }`
            );
            // changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID);
            return false;
        }
        setCoinListType(type);
        setIsHide(false);
        setIsCoinList(true);
    };

    const closeCoinList = () => {
        setIsCoinList(false);
        setTimeout(() => setIsHide(true), 900);
    };

    const init = () => {
        coinList.forEach((e) => {
            const coin = { ...e };
            getRatePreCloses(coin.symbol).then((data) => {
                // console.debug("updatePreClose dispatch", data);
                if (data.timestamp > 0) {
                    // coin.preClose = data.preClose;
                    // coin.timestamp = data.timestamp;
                    dispatch(updatePreClose({preClose: data.preClose, symbol: coin.symbol}));
                }
            });
        });
    };

    useEffect(() => {
        if (isConnect) {
            if (!isExchageNetwork(networkId)) {
                NotificationManager.warning(`This network is not supported. Please change to polygon or moonriver.`);
                // changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID);
            }
        }
    }, [isConnect, networkId]);

    useEffect(() => {
        // console.log("coinList", coinList, isConnect);
        if (!isConnect || coinList.length === 0) {
            stopInterval();
            return;
        }

        initInterval(init, 60000 * 5);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnect, coinList.length]);

    return (
        <div
            className={`flex flex-col mt-0 lg:flex-row w-full lg:justify-between lg:space-x-2 overflow-x-hidden h-fit lg:h-[90%]`}
        >
            <div
                className={`w-full lg:w-[77%] flex h-[50vh] lg:h-full lg:max-h-screen lg:grow lg:flex-row lg:space-x-2`}
            >
                <div className="hidden xl:flex">
                    <CoinList
                        isHide={false}
                        isCoinList={true}
                        closeCoinList={closeCoinList}
                        isSideBar={false}
                        isBuy={isBuy}
                    />
                </div>
                <div className="lg:flex-col w-full lg:space-y-1">
                    <div className="w-full lg:min-h-[45%] h-full lg:h-[67%] bg-blue-850 lg:rounded-lg ">
                        <TradingViewWidget isBuy={isBuy} />
                    </div>
                    <div className="hidden lg:flex w-full lg:h-[32.5%]">
                        <OrderHistories balance={balance} isBuy={isBuy} />
                    </div>
                </div>
            </div>
            <div className={`w-full lg:w-[25%] lg:h-full h-fit relative`}>
                <Order
                    isCoinList={isCoinList}
                    closeCoinList={closeCoinList}
                    openCoinList={openCoinList}
                    balance={balance}
                    setBalance={setBalance}
                    isBuy={isBuy}
                    setIsBuy={setIsBuy}
                />

                {isNotWideDevice && (
                    <CoinList
                        isHide={isHide}
                        isCoinList={isCoinList}
                        closeCoinList={closeCoinList}
                        isBuy={isBuy}
                    />
                )}
            </div>
        </div>
    );
};
export default ExchangeTV;
