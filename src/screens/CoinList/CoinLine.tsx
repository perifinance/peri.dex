import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'reducers';
import { ColoredPrice } from 'components/ColoredPrice';
import useSelectedCoin from 'hooks/useSelectedCoin';
import { updateFavorite } from 'reducers/coin/coinList';
import { ColoredLabel, SignType } from 'components/ColoredLabel';

interface CoinLineProps {
	index: number;
	// Define the props for your component here
}

const CoinLine: React.FC<CoinLineProps> = ({index}) => {
	const { coinList } = useSelector((state: RootState) => state.coinList);
	const [{ selectedType, selectedCoins }, setSelectedCoin] = useSelectedCoin();
	// const [ coin, setCoin ] = useState(null);
	const dispatch = useDispatch();

    const setFavorite = (coin) => {
        let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        favorites = [...new Set(favorites)];
        if (coin.favorite) {
            favorites = favorites.filter((e) => e.id !== coin.id);
        } else {
            favorites.push(coin.id);
        }
        console.log("favorites", coin, favorites);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        dispatch(updateFavorite({ symbol:coin.symbol, favorite: !coin.favorite }));
    };

	// useEffect(() => {
	// 	console.log("CoinLine useEffect", index);
	// 	// const coin = coinList[index];
	// 	// if (coin.symbol !== "pUSD") setCoin(coin);
		
	// // eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [index]);

	return (
		<div
			key={index}
			className={`flex flex-row justify-between px-1 py-1 items-center ${
				selectedCoins[selectedType]?.id === coinList[index]?.id
					? " border-[1px] border-cyan-850/25 bg-skyblue-950 text-gray-300"
					: coinList[index]?.isActive
					? "hover:bg-blue-950 cursor-pointer text-gray-300"
					: " text-gray-600"
			} rounded-[4px]`}
			onClick={() => {
				if (coinList[index]?.isActive && selectedCoins[selectedType]?.id !== coinList[index]?.id) {
					// dispatch(resetChartData());
					setSelectedCoin(coinList[index]?.symbol);
				}
			}}
		>
			
			{/* <div className="w-[15px] h-[15px] my-auto">
				<img
					className={`w-[15px] h-[15px] ${
						coinList[index]?.isActive ? "opacity-100" : "opacity-50"
					}`}
					src={`images/currencies/${coinList[index]?.symbol}.svg`}
					alt={`ccy-${coinList[index]?.symbol}`}
				/>
			</div> */}
			<div className="w-14 text-xs px-1">{coinList[index]?.symbol}</div>
			{/* <div
				className={`w-11 text-end text-[10px] font-medium ${
					coinList[index]?.isActive
						? coinList[index]?.upDown
							? coinList[index]?.upDown > 0
								? "text-blue-500"
								: "text-red-400"
							: "text-gray-300"
						: "text-gray-600"
				}`}
			>
				{formatNumber(coinList[index]?.price, 8)}
			</div> */}
			<ColoredLabel 
				value={coinList[index].price}
				isActive={coinList[index].isActive}
				tailWinStyle='w-11 text-end font-medium text-[10px]'
				precision={8}
			/>
			<ColoredLabel 
				value={coinList[index].price}
				prevValue={coinList[index].preClose} 
				isActive={coinList[index].isActive}
				showUpDn={SignType.Imoti}
				showPercent={true}
				useGivenPrev={true}
				tailWinStyle='w-11 text-end font-medium text-[10px]'
			/>
			{/* <div
				className={`w-11 text-end text-[10px] font-medium text-nowrap ${
					coinList[index]?.isActive
						? coinList[index]?.change !== 0
							? coinList[index]?.change > 0
								? "text-blue-500"
								: "text-red-400"
							: "text-gray-300"
						: "text-gray-600"
				}`}
			>
				{coinList[index]?.change !== 0 ? (coinList[index]?.change > 0 ? "▲" : "▼") : ""}
				{coinList[index]?.change < 0
					? formatNumber(coinList[index]?.change, 2).substring(1)
					: formatNumber(coinList[index]?.change, 2)}
				%
			</div> */}
			<div
				className="w-[10px] h-[10px] flex justify-center items-center"
				onClick={(e) => {
					if (!coinList[index]?.isActive) return;
					setFavorite(coinList[index]);
					e.stopPropagation();
					e.nativeEvent.stopImmediatePropagation();
				}}
			>
				<img
					className={`w-[10px] h-[10px] ${
						coinList[index]?.isActive ? "opacity-100" : "opacity-30"
					}`}
					src={`images/icon/bookmark_${coinList[index]?.favorite ? "on" : "off"}.svg`}
					alt="favorite"
				></img>
			</div>
		</div>
	);
};

export default CoinLine;

