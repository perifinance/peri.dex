import { useDispatch, useSelector } from "react-redux";
import { RootState } from "reducers";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis } from "recharts";
import { getChartRates } from "lib/thegraph/api";
import { formatDate, formatCurrency } from "lib";
import { utils } from "ethers";
import { setLoading } from "reducers/loading";
const Chart = () => {
	const selectedCoins = useSelector((state: RootState) => state.selectedCoin);
	const [chartTime, setChartTime] = useState("24H");
	const [data, setData] = useState([]);
	const [currencyNames, setCurrencyNames] = useState<{ source: String; destination: String }>();
	const [prices, setPrices] = useState<{
		price?: string;
		low?: string;
		high?: string;
		formatPrice?: string;
		formatLow?: string;
		formatHigh?: string;
		timestamp?: number;
		time?: string;
	}>({});

	const dispatch = useDispatch();

	const loadingHandler = (toggle: boolean) => {
		toggle ? dispatch(setLoading({ name: "balance", value: true })) : dispatch(setLoading({ name: "balance", value: false }));
	};

	const init = useCallback(async () => {
		const chartRate = await getChartRates({
			currencyNames,
			chartTime,
			loadingHandler,
		});

		setData(chartRate);
		setPrices({ ...chartRate[chartRate.length - 1] });
	}, [currencyNames, chartTime]);

	const formatPrice = (e) => {
		if (!isFinite(e)) {
			return "0";
		}

		return formatCurrency(utils.parseEther(e.toString()).toBigInt(), 8);
	};

	const setPrice = (payload) => {
		// console.log('payload', payload);
		if (payload && payload[0] && payload[0].payload) {
			setPrices(payload[0].payload);
		}
	};

	useEffect(() => {
		if (selectedCoins.source.symbol && selectedCoins.destination.symbol) {
			setCurrencyNames({
				source: selectedCoins.source.symbol,
				destination: selectedCoins.destination.symbol,
			});
		}
	}, [selectedCoins]);

	useEffect(() => {
		if (currencyNames) {
			setData([]);
			init();

			// const timeout = setInterval(() => {
			// 	init();
			// }, 1000 * 60);
			// return () => clearInterval(timeout);
		}
	}, [currencyNames, chartTime]);

	return (
		<div className="grow bg-gray-700 rounded-lg p-4 lg:px-10 lg:py-8">
			<div className="flex flex-col lg:justify-end">
				<div className="flex space-x-5">
					<div className="relative mt-1">
						<img className="w-6 h-6" src={`/images/currencies/${selectedCoins.destination.symbol}.svg`} alt="currencies"></img>
						<img className="w-6 h-6 absolute bottom-1 left-4" src={`/images/currencies/${selectedCoins.source.symbol}.svg`} alt="currencies"></img>
					</div>
					<div className="flex justify-between w-full">
						<div className="text-xl font-medium">
							{selectedCoins.destination.symbol} / {selectedCoins.source.symbol}
						</div>

						<div className="hidden lg:flex justify-between text-base text-gray-300 font-medium lg:justify-end lg:space-x-4 align-text-top">
							<span className={chartTime === "24H" ? `text-white cursor-pointer` : "cursor-pointer"} onClick={() => setChartTime("24H")}>
								24H
							</span>
							<span className={chartTime === "3D" ? `text-white cursor-pointer` : "cursor-pointer"} onClick={() => setChartTime("3D")}>
								3D
							</span>
							<span className={chartTime === "1W" ? `text-white cursor-pointer` : "cursor-pointer"} onClick={() => setChartTime("1W")}>
								1W
							</span>
							<span className={chartTime === "1M" ? `text-white cursor-pointer` : "cursor-pointer"} onClick={() => setChartTime("1M")}>
								1M
							</span>
						</div>
					</div>
				</div>

				<div className="text-xl font-medium text-skyblue-500">
					{prices?.formatPrice} {selectedCoins.source.symbol}
				</div>
				{/* <div>{ formatCurrency(exchangeRates, 8)} (${formatCurrency(exchangeRates * sourceRate / (10n ** 18n), 2)})</div> */}
				<div className="text-xs">
					<ResponsiveContainer width="100%" height="100%" debounce={1} maxHeight={400} minHeight={"15rem"}>
						<AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
							<defs>
								<linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#13DFFF" stopOpacity={0.8} />
									<stop offset="95%" stopColor="#13DFFF" stopOpacity={0} />
								</linearGradient>
							</defs>
							<Tooltip
								labelStyle={{ color: "transparent" }}
								contentStyle={{
									background: "transparent",
									borderColor: "transparent",
									color: "#151515",
								}}
								itemStyle={{ color: "#000000" }}
								position={{ y: 0 }}
								content={({ active, payload, label }) => {
									setPrice(payload);
									return (
										payload && (
											<div className="bg-gray-300 p-2">
												<div>
													<span className="">High</span>: {payload[0]?.payload?.high}
												</div>
												<div>
													<span className="">Price</span>: {payload[0]?.payload?.price}
												</div>
												<div>
													<span className="">Low</span>: {payload[0]?.payload?.low}
												</div>
												<div>{formatDate(payload[0]?.payload?.timestamp)}</div>
											</div>
										)
									);
								}}
							></Tooltip>

							<XAxis dataKey="time" />
							<YAxis dataKey="price" domain={["dataMin", "dataMax"]} tickFormatter={(e) => formatPrice(e)} hide={true} />

							{/* 라인 */}

							<Area type="monotone" dataKey="price" fillOpacity={1} stroke="#13DFFF" fill="url(#colorUv)" />
						</AreaChart>
					</ResponsiveContainer>
				</div>
				<div className="flex justify-between text-base text-gray-300 font-bold lg:hidden">
					<span className={chartTime === "24H" ? `text-white cursor-pointer` : "cursor-pointer"} onClick={() => setChartTime("24H")}>
						24H
					</span>
					<span className={chartTime === "3D" ? `text-white cursor-pointer` : "cursor-pointer"} onClick={() => setChartTime("3D")}>
						3D
					</span>
					<span className={chartTime === "1W" ? `text-white cursor-pointer` : "cursor-pointer"} onClick={() => setChartTime("1W")}>
						1W
					</span>
					<span className={chartTime === "1M" ? `text-white cursor-pointer` : "cursor-pointer"} onClick={() => setChartTime("1M")}>
						1M
					</span>
				</div>
			</div>
		</div>
	);
};
export default Chart;
