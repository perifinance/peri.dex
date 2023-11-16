import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { updatePrice, updateTooltip } from "reducers/rates";
import { Chart, CandlestickSeries } from "lightweight-charts-react-wrapper";
import { ISeriesApi, PriceFormatCustom } from 'lightweight-charts';
import { decimalSplit } from "lib/price/decimalSplit";


const Lwwchart = ({ chart = [], chartTime, lastCandle }) => {
	const dispatch = useDispatch();
    const series = useRef<ISeriesApi<'Candlestick'>>(null);

    const [legend, setLegend] = useState('ETC USD 7D VWAP');

    const setTooltipHtml = (tooltip) => {
        const color_tailwind = tooltip.open < tooltip.close ? "text-cyan-400" : "text-red-400";

        return `<div className="flex justify-around items-center lg:items-start h-7 text-xs lg:space-x-2 lg:justify-start mx-2 lg:ml-3">
        <span>
            <span className="font-medium">O:</span>
            <span className=${color_tailwind}>${decimalSplit(tooltip.open)}</span>
        </span>
        <span>
            <span className="font-medium">H:</span>
            <span className=${color_tailwind}>${decimalSplit(tooltip.high)}</span>
        </span>
        <span>
            <span className="font-medium">L:</span>
            <span className=${color_tailwind}>${decimalSplit(tooltip.low)}</span>
        </span>
        <span>
            <span className="font-medium">C:</span>
            <span className=${color_tailwind}>${decimalSplit(tooltip.close)}</span>
        </span>
    </div>`;
    };

    const getLastBar = series => {
        const lastIndex = series.dataByIndex(Infinity, -1);
        return series.dataByIndex(lastIndex);
    };

    let throttled;
    const handleCrosshairMove = useCallback((param, lastCandle = undefined) => {
        if (series.current === null) {
            return;
        }
        if (param.time) {
            const validCrosshairPoint = !(param.point.x < 0 || param.point.y < 0);
            const bar = validCrosshairPoint ? param.seriesData.get(series.current) : getLastBar(series);
            setLegend(setTooltipHtml(bar));
        } else {
            setLegend('');
        }

        if (!param.point || param.seriesPrices.size < 1 || lastCandle !== undefined) {
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
        height:384,
        // autoHeight: true,
        // autoWidth: true,
        /* rightPriceScale: {
            scaleMargins: {
                top: 0.4, // leave some space for the legend
                bottom: 0.15,
            },
        }, */
		// trackingMouseMove: trackingMode,
	};
    
    const priceFormat:PriceFormatCustom = {
        type: "custom",
        formatter: (priceValue) => {
            return decimalSplit(priceValue);
        },
        // precision: precision,
        minMove: 0.0000000001, //Math.pow(10, precision * (-1)),
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

    return (
        <Chart {...options} /* onCrosshairMove={(param) => handleCrosshairMove(param, chart[chart.length - 1])} */>
            <CandlestickSeries
                data={chart}
                
                /* priceFormat={priceFormat} */
                ref={series}
            />
            {/* <div className=''>{legend}</div> */}
        </Chart>
        
    );

};
export default React.memo(Lwwchart);