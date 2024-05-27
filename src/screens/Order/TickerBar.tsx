import useSelectedCoin from 'hooks/useSelectedCoin';
import { formatNumber } from 'lib';
import { getSafeSymbol } from 'lib/coinList';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'reducers';

interface TickerBarProps {
	openCoinList: Function;
    isCoinList?: boolean;
    closeCoinList?: Function;
	idxTarget: number;
}

const TickerBar: React.FC<TickerBarProps> = ({openCoinList, isCoinList, closeCoinList, idxTarget}) => {
	const [{ selectedCoins }] = useSelectedCoin();
	const { source, destination } = selectedCoins;
	const { coinList } = useSelector((state: RootState) => state.coinList);

	return (
		<div
			className="flex space-x-1 cursor-pointer w-full h-full justify-between items-center"
			id="list-caller"
		>
			<div
				className="flex flex-col w-[50%] justify-center"
				id="list-caller"
				onClick={() => (isCoinList ? closeCoinList() : openCoinList("destination"))}
			>
				<div
					className="flex space-x-1 mb-2 items-end cursor-pointer justify-center"
					id="list-caller"
				>
					<div className="relative w-8 h-5" id="list-caller">
						<img
							id="list-caller"
							alt="dest_symgol"
							className="w-4 h-4 md:w-5 md:h-5 absolute bottom-0 left-0 z-[2]"
							src={`/images/currencies/${
								destination?.symbol
									? getSafeSymbol(destination.symbol, false)
									: "pBTC"
							}.svg`}
						></img>
						<img
							alt="source_symgol"
							className="w-4 h-4 md:w-5 md:h-5 absolute bottom-0 left-3 z-[1]"
							src={`/images/currencies/${
								source?.symbol
									? getSafeSymbol(source.symbol)
									: "pUSD"
							}.svg`}
						></img>
					</div>
					<div
						className="text-[12px] font-medium tracking-tighter mr-1 text-center"
						id="list-caller"
					>
						{getSafeSymbol(destination.symbol, false)} /{" "}
						{getSafeSymbol(source.symbol)}
					</div>
					<div className="transform-gpu m-auto" id="list-caller">
						<img
							className="w-3 h-3 align-middle rotate-90"
							src={"/images/icon/exchange.png"}
							alt="netswap"
						/>
					</div>
				</div>
				<div
					className={`text-2xl font-bold tracking-wide text-center w-full ${
						coinList[idxTarget]?.upDown
							? coinList[idxTarget]?.upDown > 0
								? "text-blue-500"
								: "text-red-400"
							: "text-gray-300"
					}`}
					id="list-caller"
				>
					{formatNumber(coinList[idxTarget]?.price, 8)}
				</div>
				<div
					className={`flex flex-row text-[10px] ss:text-xs justify-center gap-8 ${
						coinList[idxTarget]?.change !== 0
							? coinList[idxTarget]?.change > 0
								? "text-blue-500"
								: "text-red-400"
							: "text-gray-300"
					} font-[500]`}
					id="list-caller"
				>
					<div className="" id="list-caller">
						{`${coinList[idxTarget]?.change > 0 ? "+" : ""}${
							coinList[idxTarget]?.preClose > 0
								? formatNumber(
									coinList[idxTarget]?.price -
										coinList[idxTarget]?.preClose,
									8
								)
								: "0"
						}`}
					</div>
					<div className={``} id="list-caller">
						{`${
							coinList[idxTarget] && coinList[idxTarget].change > 0n
								? "+"
								: ""
						}${formatNumber(coinList[idxTarget]?.change, 2)}%`}
					</div>
				</div>
			</div>
			<div className="flex flex-col w-[25%] min-w-fit items-center space-y-2 lg:space-y-4">
				<div className="w-full flex flex-col justify-start">
					<div
						className={`h-4 text-[6px] ss:text-[8px] text-gray-450 font-medium tracking-tight text-start w-full`}
					>
						{`24h high`}
					</div>
					<div
						className={`text-[10px] ss:text-xs font-medium tracking-wide text-start w-full`}
					>
						{`${formatNumber(coinList[idxTarget]?.high, 8)}`}
					</div>
				</div>
				<div className="w-full flex flex-col justify-end">
					<div
						className={`h-4 text-[6px] ss:text-[8px] text-gray-450 font-medium tracking-tight text-start w-full`}
					>
						{`24h low`}
					</div>
					<div
						className={`text-[10px] ss:text-xs font-medium tracking-wide text-start w-full`}
					>
						{`${formatNumber(coinList[idxTarget]?.low, 8)}`}
					</div>
				</div>
			</div>
		</div>
	);
};

export default TickerBar;