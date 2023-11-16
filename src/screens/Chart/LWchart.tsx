// ? LightWeight Chart Old DOCS https://tradingview.github.io/lightweight-charts/docs/api/interfaces/TimeScaleOptions#barspacing

import React, { useCallback, useEffect, useRef, useState } from "react";
import Chart from "@qognicafinance/react-lightweight-charts";
import { updatePrice, updateTooltip } from "reducers/rates";
import { useDispatch, /* useSelector */ } from "react-redux";
import { decimalSplit, /* getPrecision */ } from "lib/price/decimalSplit";
// import { RootState } from "reducers";
// import { setLoading } from "reducers/loading";

const LWchart = ({ chart = [], chartTime, lastCandle }) => {
	const dispatch = useDispatch();
	// const [precision, setPrecision] = useState(0); 
	// const [trackingMode, setTrackingMode] = useState(false);

	const options = {
		alignLabels: false,
		timeScale: {
			rightOffset: 3,
			barSpacing: 10.5,
			// lockVisibleTimeRangeOnResize: false,
			// rightBarStaysOnScroll: false,
			// borderVisible: false,
			visible: true,
			timeVisible: chartTime === "15M" || chartTime === "4H" ? true : false,
			secondsVisible: false,
			tickMarkFormatter: (time) => {
				const date = new Date(time * 1000);
				const month = date.getMonth() + 1;
				const day = date.getDate();
				const hour = date.getHours();
				const min = date.getMinutes();
				return chartTime === "15M" ? `${hour < 10 ? `0${hour}` : hour}:${min < 10 ? `0${min}` : `${min}`}` : `${month}/${day}`;
			},
			rightBarStaysOnScroll: true,
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
		from: chart[0]?.time,
		to: chart[chart.length - 1]?.time,
		crosshair: {
			mode: 0,
		},
		business: {
			tickMarkFormatter: (time) => {
				return time["month"] + "/" + time["day"];
			},
		},
		handleScale: {
			mouseWheel: true,
			pinch: true,
			axisPressedMouseMove: false,
			pressedMouseMove: true,
			horzTouchDrag: true,
			vertTouchDrag: true,
		},
		handleScroll: true,
		kineticScroll: {
			touch: true,
			mouse: true,
		},
		// trackingMouseMove: trackingMode,
	};

	useEffect(() => {
		if (chart.length > 0) {
			dispatch(updatePrice({ close: decimalSplit(chart[chart.length - 1].close) }));
			dispatch(
				updateTooltip({
					...chart[chart.length - 1],
					open: decimalSplit(chart[chart.length - 1].open),
					high: decimalSplit(chart[chart.length - 1].high),
					low: decimalSplit(chart[chart.length - 1].low),
					close: decimalSplit(chart[chart.length - 1].close),
				})
			);
		}
	}, [chart, dispatch]);

	// const mounted = useRef(false);
	// useEffect(() => {
	// 	if  (!mounted.current) {
	// 		mounted.current = true;
	// 		console.log("mounted", mounted.current);
	// 	} else if (lastCandle) {
	// 		console.log("lastCandle", lastCandle);
	// 		const pre = getPrecision(lastCandle.close);
	// 		setPrecision(pre);
	// 		setTrackingMode(!trackingMode);
	// 	}
	// }, [lastCandle]);

	let throttled;
	const handleCrosshairMoved = useCallback((param, lastCandle = undefined) => {
		
		if ((!param.point || param.seriesPrices.size < 1) && lastCandle) {
			// console.log("param", param, "lastCandle", lastCandle);
			dispatch(updatePrice({ close: lastCandle.close }));
			dispatch(
				updateTooltip({
					...lastCandle,
					open: decimalSplit(lastCandle.open),
					high: decimalSplit(lastCandle.high),
					low: decimalSplit(lastCandle.low),
					close: decimalSplit(lastCandle.close),
				})
			);
			return;
		} else if (!throttled) {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			throttled = setTimeout(() => {
				throttled = null;

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
			}, 0);
		}
	}, []);

	return (
		<Chart
			options={options}
			candlestickSeries={[{ data: chart }]}
			autoWidth 
			autoHeight
			// height={380}
			onCrosshairMove={(param) => handleCrosshairMoved(param, chart[chart.length - 1])}
			chartRef={(chart) => {
				
				chart.addCandlestickSeries({
					priceFormat: {
						type: "custom",
						formatter: (priceValue) => {
							return decimalSplit(priceValue);
						},
						// precision: precision,
						minMove: 0.0000000001, //Math.pow(10, precision * (-1)),
					},
				});

				// Apply the custom priceFormatter to the chart
				chart.applyOptions({
					rightPriceScale: {
						scaleMargins: {
							top: 0.2, // leave some space for the legend
							bottom: 0.05,
						},
					},
				});

			}}
		/>
	);
};

export default React.memo(LWchart);
