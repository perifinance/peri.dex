import { useDispatch, useSelector } from "react-redux";
import { RootState } from "reducers";
import { useEffect, useState, useCallback } from "react";
import { setLoading } from "reducers/loading";
import CustomCandleStick from "screens/Chart/CandleStick";
import axios from "axios";
import { updatePrice, updateTooltip } from "reducers/rates";
import { decimalSplit } from "lib/price/decimalSplit";

const Chart = () => {
	const dispatch = useDispatch();

	const selectedCoins = useSelector((state: RootState) => state.selectedCoin);
	const { close, tooltip } = useSelector((state: RootState) => state.exchangeRates);

	const [chartTime, setChartTime] = useState("15M");
	const [currencyNames, setCurrencyNames] = useState<{ source: String; destination: String }>();
	const [source, setSource] = useState([]);
	const [destinate, setDestinate] = useState([]);

	const loadingHandler = useCallback(
		(toggle: boolean) => {
			toggle ? dispatch(setLoading({ name: "balance", value: true })) : dispatch(setLoading({ name: "balance", value: false }));
		},
		[dispatch]
	);

	const setPrepareData = useCallback(async (data: any, key, sliceLength) => {
		const title = [
			"openTime",
			"open",
			"high",
			"low",
			"close",
			"volume",
			"closeTime",
			"quoteAssetVolume",
			"numberOfTrades",
			"takerBuyBaseAssetVolume",
			"takerBuyQuoteAssetVolume",
			"ignore",
		];

		const dataList = data
			? await data.data.slice(sliceLength, data.data.length).map((candle) => {
					const result = { openClose: [] };
					candle.forEach((name, idx) => {
						if (idx === 1) {
							result.openClose[0] = Number(name);
						}

						if (idx === 4) {
							result.openClose[1] = Number(name);
						}

						if (idx === 0) {
							result[title[idx]] = name;
						} else {
							result[title[idx]] = name;
						}
					});
					return result;
			  })
			: [];

		if (key === "source") {
			setSource(dataList);
		} else if (key === "destination") {
			setDestinate(dataList);
		}
	}, []);

	const color = tooltip.open < tooltip.close ? "long" : "short";

	const runTimer = (url, symbol, interval, key, sliceLength) => {
		setTimeout(async () => {
			if (currencyNames[key] !== "pUSD") {
				await axios
					.get(url, {
						headers: { "Access-Control-Allow-Origin": "*" },
						params: { symbol: symbol, interval: interval },
					})
					.then((res) => {
						setPrepareData(res, key, sliceLength);
						loadingHandler(false);
					});
			}
		}, 300000);
	};

	const init = useCallback(async () => {
		let interval = "";
		let sliceLength = 0; // cutting data length

		switch (chartTime) {
			case "15M":
				interval = "15m";
				break;
			case "4H":
				interval = "4h";
				break;
			case "24H":
				interval = "1d";
				break;
			case "3D":
				interval = "3d";
				break;
			case "1W":
				interval = "1w";
				break;
			case "1M":
				interval = "1M";
				break;
			default:
				interval = "15m";
				break;
		}

		Object.keys(currencyNames).forEach(async (key) => {
			loadingHandler(true);

			const symbol = currencyNames[key].replace("p", "");
			const url = "https://dex-api.peri.finance/api/v1/binance";
			if (currencyNames[key] !== "pUSD") {
				await axios
					.get(url, {
						headers: { "Access-Control-Allow-Origin": "*" },
						params: { symbol: symbol, interval: interval },
					})
					.then((res) => {
						setPrepareData(res, key, sliceLength);
						loadingHandler(false);
					});

				// runTimer(url, symbol, interval, key, sliceLength);
			} else {
				setPrepareData(undefined, key, sliceLength);
			}
		});
	}, [chartTime, currencyNames, setPrepareData]);

	useEffect(() => {
		if (selectedCoins.source.symbol && selectedCoins.destination.symbol) {
			setCurrencyNames({
				source: selectedCoins.source.symbol,
				destination: selectedCoins.destination.symbol,
			});
		}
	}, [selectedCoins]);

	useEffect(() => {
		loadingHandler(true);

		if (currencyNames) {
			init();
		}
	}, [currencyNames, chartTime, loadingHandler, init]);

	return (
		<div className="grow bg-gray-700 rounded-lg p-4 lg:px-10 lg:py-8">
			<div className="flex flex-col lg:justify-end">
				<div className="flex space-x-5">
					<div className="relative mt-1">
						<img className="w-6 h-6" src={`/images/currencies/${selectedCoins.destination.symbol}.svg`} alt="currencies"></img>
						<img
							className="w-6 h-6 absolute bottom-1 left-4"
							src={`/images/currencies/${selectedCoins.source.symbol}.svg`}
							alt="currencies"
						></img>
					</div>
					<div className="flex justify-between w-full">
						<div className="text-xl font-medium">
							{selectedCoins.destination.symbol} / {selectedCoins.source.symbol}
						</div>

						<div className="hidden lg:flex justify-between text-base text-gray-300 font-medium lg:justify-end lg:space-x-4 align-text-top">
							<span
								className={chartTime === "15M" ? `text-white cursor-pointer` : "cursor-pointer"}
								onClick={() => setChartTime("15M")}
							>
								15M
							</span>
							<span
								className={chartTime === "4H" ? `text-white cursor-pointer` : "cursor-pointer"}
								onClick={() => setChartTime("4H")}
							>
								4H
							</span>
							<span
								className={chartTime === "24H" ? `text-white cursor-pointer` : "cursor-pointer"}
								onClick={() => setChartTime("24H")}
							>
								24H
							</span>
							{/* <span
								className={chartTime === "3D" ? `text-white cursor-pointer` : "cursor-pointer"}
								onClick={() => setChartTime("3D")}
							>
								3D
							</span> */}
							<span
								className={chartTime === "1W" ? `text-white cursor-pointer` : "cursor-pointer"}
								onClick={() => setChartTime("1W")}
							>
								1W
							</span>
							{/* <span
								className={chartTime === "1M" ? `text-white cursor-pointer` : "cursor-pointer"}
								onClick={() => setChartTime("1M")}
							>
								1M
							</span> */}
						</div>
					</div>
				</div>

				{/* TOOLTIP */}
				<div className="flex items-center space-x-4">
					<div className="text-xl font-medium text-skyblue-500 w-48">
						{decimalSplit(close)} {selectedCoins.source.symbol}
					</div>
					<div className="space-x-3">
						<span>
							Open: <span className={`text-${color}-500`}>{tooltip.open}</span>
						</span>
						<span>
							High: <span className={`text-${color}-500`}>{tooltip.high}</span>
						</span>
						<span>
							Low: <span className={`text-${color}-500`}>{tooltip.low}</span>
						</span>
						<span>
							Close: <span className={`text-${color}-500`}>{tooltip.close}</span>
						</span>
					</div>
				</div>

				<div className="text-xs">
					<CustomCandleStick source={source} destinate={destinate} chartTime={chartTime} />
				</div>
				<div className="flex justify-between text-base text-gray-300 font-bold lg:hidden">
					<span
						className={chartTime === "15M" ? `text-white cursor-pointer` : "cursor-pointer"}
						onClick={() => setChartTime("15M")}
					>
						15M
					</span>
					<span
						className={chartTime === "4H" ? `text-white cursor-pointer` : "cursor-pointer"}
						onClick={() => setChartTime("4H")}
					>
						4H
					</span>
					<span
						className={chartTime === "24H" ? `text-white cursor-pointer` : "cursor-pointer"}
						onClick={() => setChartTime("24H")}
					>
						24H
					</span>
					{/* <span
						className={chartTime === "3D" ? `text-white cursor-pointer` : "cursor-pointer"}
						onClick={() => setChartTime("3D")}
					>
						3D
					</span> */}
					<span
						className={chartTime === "1W" ? `text-white cursor-pointer` : "cursor-pointer"}
						onClick={() => setChartTime("1W")}
					>
						1W
					</span>
					{/* <span
						className={chartTime === "1M" ? `text-white cursor-pointer` : "cursor-pointer"}
						onClick={() => setChartTime("1M")}
					>
						1M
					</span> */}
				</div>
			</div>
		</div>
	);
};
export default Chart;
