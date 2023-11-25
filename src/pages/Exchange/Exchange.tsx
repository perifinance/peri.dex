import { useEffect, useState } from "react";
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

const Exchange = () => {
    const dispatch = useDispatch();
    const { networkId, isConnect } = useSelector((state: RootState) => state.wallet);
    const selectedCoins = useSelector((state: RootState) => state.selectedCoin);
    const [isCoinList, setIsCoinList] = useState(false);
    const [coinListType, setCoinListType] = useState(null);
    const [balance, setBalance] = useState(0n);

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
        setIsCoinList(true);
    };

    const selectedCoin = (coin) => {
        dispatch(setLoading({ name: "balance", value: true }));

        if (coin) {
            if (selectedCoins.destination === coin || selectedCoins.source === coin)
            {
                NotificationManager.warning(`Please select a different token`, "", 2000);
            } else {
                if (coinListType === "source") {
                    dispatch(setSourceCoin(coin));
                } else if (coinListType === "destination") {
                    dispatch(setDestinationCoin(coin));
                }
            }
        }
        setIsCoinList(false);
        dispatch(setLoading({ name: "balance", value: false }));
    };

    const closeCoinList = () => {
        setIsCoinList(false);
    };

    useEffect(() => {
        if (isConnect) {
            if (!isExchageNetwork(networkId)) {
                NotificationManager.warning(`This network is not supported. Please change to polygon or moonriver.`);
                // changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID);
            }
        }
    }, [isConnect, networkId]);

    return (
        <div className="flex flex-col lg:flex-row lg:justify-between lg:space-x-2 xl:space-x-4">
            <div className={`lg:flex lg:grow lg:flex-col`}>
                <Chart />
                <div className=" hidden lg:flex ">
                    <OrderHistories  balance={balance}/>
                </div>
            </div>
            <div className={`h-full ${isCoinList && "hidden"}`}>
                <Order openCoinList={openCoinList} balance={balance} setBalance={setBalance} />
            </div>
            <div className={`${!isCoinList && "hidden"}`}>
                <CoinList
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
