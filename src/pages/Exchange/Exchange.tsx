import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux"
import { RootState } from 'reducers'

import Order from 'screens/Order'
import CoinList from 'screens/CoinList'
import OrderHistories from 'screens/OrderHistories'
import Chart from 'screens/Chart'
import { setSourceCoin, setDestinationCoin } from 'reducers/coin/selectedCoin'
import { NotificationManager } from 'react-notifications';

const Exchange = () => {
    const dispatch = useDispatch();
    const { networkId, isConnect } = useSelector((state: RootState) => state.wallet);
    const [isCoinList, setIsCoinList] = useState(false);
    const [coinListType, setCoinListType] = useState(null);
    const [networkCheck, setNetworkCheck] = useState(false);

    const openCoinList = (type) => {
        setCoinListType(type);
        setIsCoinList(true);
    }

    const selectedCoin = (coin) => {
        if(coin) {
            if(coinListType === 'source') {
                dispatch(setSourceCoin(coin))
            } else {
                dispatch(setDestinationCoin(coin))
            }
        }
        setIsCoinList(false);
    }
    
    useEffect(() => {
        if(isConnect) {
            if(networkId !== Number(process.env.REACT_APP_DEFAULT_NETWORK_ID)) {
                NotificationManager.warning(`This network is not supported. Please change to moonbase network`, 'ERROR');
    
            }
        }
    }, [isConnect, networkId])

    return (
        <div className="lg:flex lg:flex-row lg:py-7 lg:justify-between lg:space-x-4 xl:space-x-20">
            {isCoinList ? 
                (<CoinList coinListType={coinListType} selectedCoin={selectedCoin}/>) :
                (<> 
                    <Order openCoinList={openCoinList}/>
                    
                </>
                )
            }
            <div className={`lg:flex lg:flex-col lg:w-full ${isCoinList && 'hidden lg: visible'}`}>
                <Chart/>
                <OrderHistories/>
            </div>
        </div>
    )
}
export default Exchange;