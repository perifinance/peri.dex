import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'reducers';

import FuturesOrder from 'screens/FuturesOrder'
import CoinList from 'screens/CoinList'
import { setSourceCoin, setDestinationCoin } from 'reducers/coin/selectedCoin'
const Futures = () => {
    const dispatch = useDispatch();
    const selectedCoins = useSelector((state: RootState) => state.selectedCoin);
    const [isCoinList, setIsCoinList] = useState(false);
    const [coinListType, setCoinListType] = useState(null);
    const [per, setPer] = useState(0);
    
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
                (<CoinList selectedCoin={selectedCoin}/>) :
                (<FuturesOrder openCoinList={openCoinList}/>)
            }
        </>
    )
}
export default Futures;