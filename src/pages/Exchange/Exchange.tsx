import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux"
import { RootState } from 'reducers'

import Order from 'screens/Order'
import CoinList from 'screens/CoinList'
import OrderHistories from 'screens/OrderHistories'
import Chart from 'screens/Chart'
import { setSourceCoin, setDestinationCoin } from 'reducers/coin/selectedCoin'
import { NotificationManager } from 'react-notifications';
import { changeNetwork } from 'lib/network'

const Exchange = () => {
    const dispatch = useDispatch();
    const { networkId, isConnect } = useSelector((state: RootState) => state.wallet);
    const [isCoinList, setIsCoinList] = useState(false);
    const [coinListType, setCoinListType] = useState(null);

    const openCoinList = (type) => {
        if(networkId !== Number(process.env.REACT_APP_DEFAULT_NETWORK_ID)) {
            NotificationManager.warning(`This network is not supported. Please change to moonriver network`, 'ERROR');
            changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID)
            return false;
        }
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
                NotificationManager.warning(`This network is not supported. Please change to moonriver network`, 'ERROR');
                changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID)
            }
        }
    }, [isConnect, networkId])

    return (
        <div className="flex flex-col-reverse lg:flex-row lg:justify-between lg:space-x-4 xl:space-x-8">
            
            <div className={`lg:flex lg:grow lg:flex-col lg:w-full ${isCoinList && 'hidden lg: visible'} flex-1`}>
                <Chart/>
                <OrderHistories/>
            </div>
            
            {isCoinList ? 
                (<CoinList coinListType={coinListType} selectedCoin={selectedCoin}/>) :
                (<> 
                    <Order openCoinList={openCoinList}/>
                    
                </>
                )
            }
        </div>
    )
}
export default Exchange;