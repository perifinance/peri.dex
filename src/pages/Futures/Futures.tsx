import { useState } from 'react';
import { useDispatch } from 'react-redux';

import FuturesOrder from 'screens/FuturesOrder'
import CoinList from 'screens/CoinList'
import { setSourceCoin, setDestinationCoin } from 'reducers/coin/selectedCoin'
const Futures = () => {
    const dispatch = useDispatch();
    const [isCoinList, setIsCoinList] = useState(false);
    const [coinListType, setCoinListType] = useState(null);
    
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

    return (
        <>
            {isCoinList ? 
                (<CoinList coinListType={coinListType} selectedCoin={selectedCoin}/>) :
                (<FuturesOrder openCoinList={openCoinList}/>)
            }
        </>
    )
}
export default Futures;