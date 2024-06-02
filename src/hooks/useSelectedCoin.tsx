import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "reducers";
import { setDestinationCoin, setSourceCoin } from "reducers/coin/selectedCoin";

type useSelectedCoinType = () => [{selectedType: string, selectedCoins: {source:any, destination:any}}, (symbol: string, type?: string) => void, (type: string) => void];

const useSelectedCoin:useSelectedCoinType = () => {
	const [selectedType, setselectedType] = useState<string>("destination");
	const selectedCoins = useSelector((state: RootState) => state.selectedCoin);
	const { coinList, symbolMap } = useSelector((state: RootState) => state.coinList);
	const dispatch = useDispatch();

	const setSelectedCoin = (symbol, type = "destination") => {
        if (selectedCoins.destination && selectedCoins.destination.symbol === symbol) return;

        const idx = symbolMap[symbol];

        if (idx) {
            const coin = {...coinList[idx], index: idx};
            console.debug("setSelectedCoin", coin, type);
            if ([selectedType, type].includes("source")) {
                dispatch(setSourceCoin(coin));
            } else if ([selectedType, type].includes("destination")) {
                dispatch(setDestinationCoin(coin));
            }
            // const rate = coin.price;
            // dispatch(updateLastRateData({ ...lastRateData, symbol: coin.symbol, rate }));
        } else {
            console.debug("setSelectedCoin index not found", symbol, type);
        }
    };

	return [ {selectedType, selectedCoins}, setSelectedCoin, setselectedType ];
};

export default useSelectedCoin;