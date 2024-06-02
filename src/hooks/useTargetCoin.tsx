import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "reducers";


const useTargetCoin = () => {
	const { coinList } = useSelector((state: RootState) => state.coinList);
	const { destination } = useSelector((state: RootState) => state.selectedCoin);
	const [targetIndex, setTargetIndex] = useState(destination.index);
	const [targetCoin, setTargetCoin] = useState(coinList[targetIndex]);

	useEffect(() => {
		setTargetIndex(destination.index);
	}, [destination]);

	useEffect(() => {
		setTargetCoin(coinList[targetIndex]);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [targetIndex, coinList[targetIndex]]);

	return { targetIndex, targetCoin };
};

export default useTargetCoin;

