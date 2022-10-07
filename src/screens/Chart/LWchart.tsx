import React, { useState, useCallback } from "react";
import Chart from "@qognicafinance/react-lightweight-charts";
import { updatePrice, updateTooltip } from "reducers/rates";
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

				const date = new Date(param.time * 1000);
				const year = date.getFullYear();
				const month = date.getMonth() + 1;
				const day = date.getDate();

				const obj = param.seriesPrices.entries().next().value[1];
				dispatch(updatePrice({ close: cutDecimals(obj.close) }));
				dispatch(
					updateTooltip({
						...obj,
						open: cutDecimals(obj.open),
						high: cutDecimals(obj.high),
						low: cutDecimals(obj.low),
						close: cutDecimals(obj.close),
						year,
						month,
						day,
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
			onCrosshairMove={handleCrosshairMoved}
			chartRef={(chart) => {
				chart.timeScale().fitContent();
				// chart.timeScale().scrollToPosition(2, true);
			}}
		/>
	);
};

export default LWchart;
