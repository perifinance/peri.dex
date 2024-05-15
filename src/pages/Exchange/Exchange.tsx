import { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "reducers";
import { NotificationManager } from "react-notifications";

import Order from "screens/Order";
import CoinList from "screens/CoinList";
import OrderHistories from "screens/OrderHistories";
import Chart from "screens/Chart";
import { setSourceCoin, setDestinationCoin } from "reducers/coin/selectedCoin";
import { setLoading } from "reducers/loading";
// import { changeNetwork } from "lib/network";
import { networkInfo } from "configure/networkInfo";
import { isExchageNetwork } from "lib/network";
import { getRateTickers } from "lib/thegraph/api/getRateTickers";
import { updatePrice } from "reducers/coin/coinList";

const Exchange = () => {
    const dispatch = useDispatch();
    const { networkId, isConnect } = useSelector((state: RootState) => state.wallet);
    const selectedCoins = useSelector((state: RootState) => state.selectedCoin);
    const [isCoinList, setIsCoinList] = useState(false);
    const [coinListType, setCoinListType] = useState(null);
    const [balance, setBalance] = useState(0n);
    const [isHide, setIsHide] = useState(true);
    const [timeInterval, setTimeInterval] = useState(null);

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

    const selectedCoin = (coin) => {
        dispatch(setLoading({ name: "balance", value: true }));

        if (coin) {
            if (selectedCoins.destination.symbol === coin.symbol || selectedCoins.source.symbol === coin.symbol) {
                NotificationManager.warning(`Please select a different token`, "", 2000);
            } else {
                if (coinListType === "source") {
                    dispatch(setSourceCoin(coin));
                } else if (coinListType === "destination") {
                    dispatch(setDestinationCoin(coin));
                }
            }
        }
        // setIsCoinList(false);
        dispatch(setLoading({ name: "balance", value: false }));
    };

    const closeCoinList = () => {
        setIsCoinList(false);
        setTimeout(() => setIsHide(true), 900);
    };

    const init = async () => {
        const rateTickers = await getRateTickers();
        // console.log("rateTickers", rateTickers);

        dispatch(updatePrice(rateTickers));
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
        if (!isConnect) {
            if (timeInterval) clearInterval(timeInterval);
            return;
        }

        const interval = setInterval(() => {
            if (isConnect) {
                init();
            }
        }, 30000);

        setTimeInterval(interval);

        return () => clearInterval(interval); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnect]);

    return (
        <div className={`flex flex-col mt-0 sm:mt-2 lg:flex-row w-full lg:justify-between lg:space-x-2 xl:space-x-4 overflow-x-hidden h-fit lg:h-[85%]`}>
            <div className={`w-full lg:w-[77%] flex h-[50vh] lg:h-full lg:max-h-screen lg:grow lg:flex-col gap-2`}>
                <div className="w-full lg:min-h-[45%] h-full lg:h-[67%] lg:px-5 lg:py-2 bg-blue-900 rounded-t-lg lg:rounded-lg ">
                    <Chart />
                </div>
                <div className="hidden lg:flex w-full lg:h-[32%]">
                    <OrderHistories balance={balance} />
                </div>
            </div>
            <div className={`w-full lg:w-[25%] lg:h-full h-fit relative`}>
                <Order
                    isCoinList={isCoinList}
                    coinListType={coinListType}
                    closeCoinList={closeCoinList}
                    openCoinList={openCoinList}
                    balance={balance}
                    setBalance={setBalance}
                />
                <CoinList
                    isHide={isHide}
                    isCoinList={isCoinList}
                    coinListType={coinListType}
                    selectedCoin={selectedCoin}
                    closeCoinList={closeCoinList}
                />
            </div>
        </div>
    );
};
export default Exchange;

