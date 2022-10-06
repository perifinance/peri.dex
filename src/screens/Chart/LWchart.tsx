import React, { useState, useCallback } from "react";
import Chart from "@qognicafinance/react-lightweight-charts";
import { updatePrice } from "reducers/rates";
import { useDispatch } from "react-redux";

const cutDecimals = (str) => {
	const splitStr = str.split(".");
	splitStr[1] = splitStr[1][1] === "0" ? splitStr[1][1].slice(0, 2) : splitStr[1][1].slice(0, 4);

	return splitStr[1][3] === "0" || splitStr[1][2] === "0" ? splitStr[0] : splitStr.join(".");
};

const LWchart = (chart) => {
	const candleSeries = chart.chart.map((el) => {
		const timestamp = new Date(el.openTime);
		const year = timestamp.getFullYear();
		const month = timestamp.getMonth() + 1;
		const day = timestamp.getDate();
		const hour = timestamp.getHours();
		const min = timestamp.getMinutes();
		// const second = timestamp.getSeconds();
		const openTime = `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day} ${
			hour < 10 ? `0${hour}` : hour
		}:${min < 10 ? `0${min}` : min}`;

		// Date.parse('2019-04-11 09:43')/1000

		return {
			time: Date.parse(openTime) / 1000,
			open: Number(el.open),
			high: Number(el.high),
			low: Number(el.low),
			close: Number(el.close),
			...el,
		};
	});

	const options = {
		alignLabels: false,
		timeScale: {
			rightOffset: 0,
			barSpacing: 12,
			lockVisibleTimeRangeOnResize: false,
			rightBarStaysOnScroll: false,
			borderVisible: false,
			visible: true,
			timeVisible: chart.chartTime === "15M" ? true : false,
			secondsVisible: false,
			tickMarkFormatter: (time) => {
				const date = new Date(time * 1000);
				const month = date.getMonth() + 1;
				const day = date.getDate();
				return `${month}/${day}`;
			},
		},
		layout: {
			backgroundColor: "#212121",
			textColor: "#ebebeb",
		},
		grid: {
			vertLines: {
				color: "#212121",
			},
			horzLines: {
				color: "#212121",
			},
		},
		from: candleSeries[0]?.time,
		to: candleSeries[candleSeries.length - 1]?.time,
		crosshair: {
			mode: 0,
		},
		business: {
			tickMarkFormatter: (time) => {
				return time["month"] + "/" + time["day"];
			},
		},
		handleScale: {
			mouseWheel: false,
			pressedMouseMove: false,
			horzTouchDrag: false,
			vertTouchDrag: false,
		},
		handleScroll: false,
		kineticScroll: {
			touch: false,
			mouse: false,
		},
	};

	const [{ open, high, low, close }, setTooltip] = useState({ open: "0", high: "0", low: "0", close: "0" });
	const dispatch = useDispatch();

	let throttled;
	const handleCrosshairMoved = useCallback((param) => {
		if (!throttled) {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			throttled = setTimeout(() => {
				throttled = null;

				if (!param.point || param.seriesPrices.size < 1) {
					return;
				}

				const obj = param.seriesPrices.entries().next().value[1];
				dispatch(updatePrice({ close: cutDecimals(obj.close) }));
				setTooltip({
					open: cutDecimals(obj.open),
					high: cutDecimals(obj.high),
					low: cutDecimals(obj.low),
					close: cutDecimals(obj.close),
				});
			}, 100);
		}
	}, []);

	const color = open < close ? "long" : "short";

	return (
		<>
			<div className="space-x-3">
				<span>
					Open: <span className={`text-${color}-500`}>{open}</span>
				</span>
				<span>
					High: <span className={`text-${color}-500`}>{high}</span>
				</span>
				<span>
					Low: <span className={`text-${color}-500`}>{low}</span>
				</span>
				<span>
					Close: <span className={`text-${color}-500`}>{close}</span>
				</span>
			</div>

			<Chart
				options={options}
				candlestickSeries={[{ data: candleSeries }]}
				autoWidth
				height={380}
				onCrosshairMove={handleCrosshairMoved}
				chartRef={(chart) => {
					chart.timeScale().fitContent();
				}}
			/>
		</>
	);
};

export default LWchart;
