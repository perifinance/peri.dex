import React, { useCallback, useEffect } from "react";
import Chart from "@qognicafinance/react-lightweight-charts";
import { updatePrice, updateTooltip } from "reducers/rates";
import { useDispatch } from "react-redux";
import { decimalSplit } from "lib/price/decimalSplit";

const LWchart = (chart) => {
	const dispatch = useDispatch();

	const candleSeries = chart.chart.map((el) => {
		const timestamp = new Date(el.openTime);
		const year = timestamp.getFullYear();
		const month = timestamp.getMonth() + 1;
		const day = timestamp.getDate();
		const hour = timestamp.getHours();
		const min = timestamp.getMinutes();
		const openTime = `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day} ${
			hour < 10 ? `0${hour}` : hour
		}:${min < 10 ? `0${min}` : min}`;

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
			rightOffset: 3,
			barSpacing: 15.5,
			// lockVisibleTimeRangeOnResize: false,
			// rightBarStaysOnScroll: false,
			// borderVisible: false,
			visible: true,
			timeVisible: chart.chartTime === "15M" || chart.chartTime === "4H" ? true : false,
			secondsVisible: false,
			tickMarkFormatter: (time) => {
				const date = new Date(time * 1000);
				const month = date.getMonth() + 1;
				const day = date.getDate();
				const hour = date.getHours();
				const min = date.getMinutes();
				return chart.chartTime === "15M"
					? `${hour < 10 ? `0${hour}` : hour}:${min < 10 ? `0${min}` : `${min}`}`
					: `${month}/${day}`;
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

	useEffect(() => {
		if (chart.chart.length > 0) {
			dispatch(updatePrice({ close: decimalSplit(chart.chart[chart.chart.length - 1].close) }));
			dispatch(
				updateTooltip({
					...chart.chart[chart.chart.length - 1],
					open: decimalSplit(chart.chart[chart.chart.length - 1].open),
					high: decimalSplit(chart.chart[chart.chart.length - 1].high),
					low: decimalSplit(chart.chart[chart.chart.length - 1].low),
					close: decimalSplit(chart.chart[chart.chart.length - 1].close),
				})
			);
		}
	}, [chart, dispatch]);

	let throttled;
	const handleCrosshairMoved = useCallback((param, lastCandle) => {
		if (!throttled) {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			throttled = setTimeout(() => {
				throttled = null;

				if (!param.point || param.seriesPrices.size < 1) {
					return;
				}

				// todo out focus mouse over
				// const { open, high, low, close } = lastCandle;

				// dispatch(updatePrice({ close: lastCandle.close }));
				// dispatch(
				// 	updateTooltip({
				// 		open: cutDecimals(open),
				// 		high: cutDecimals(high),
				// 		low: cutDecimals(low),
				// 		close: cutDecimals(close),
				// 		year,
				// 		month,
				// 		day,
				// 	})
				// );

				const obj = param.seriesPrices.entries().next().value[1];
				dispatch(updatePrice({ close: decimalSplit(obj.close) }));
				dispatch(
					updateTooltip({
						...obj,
						open: decimalSplit(obj.open),
						high: decimalSplit(obj.high),
						low: decimalSplit(obj.low),
						close: decimalSplit(obj.close),
					})
				);
			}, 100);
		}
	}, []);

	return (
		<Chart
			options={options}
			candlestickSeries={[{ data: candleSeries }]}
			autoWidth
			height={380}
			onCrosshairMove={(param) => handleCrosshairMoved(param, candleSeries[candleSeries.length - 1])}
			chartRef={(chart) => {
				chart.timeScale().fitContent();
				// chart.timeScale().scrollToPosition(2, true);
			}}
		/>
	);
};

export default React.memo(LWchart);
