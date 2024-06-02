// ? LightWeight Chart Old DOCS https://tradingview.github.io/lightweight-charts/docs/api/interfaces/TimeScaleOptions#barspacing

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ColorType, CrosshairMode, ISeriesApi } from "lightweight-charts";

import { updateTooltip } from "reducers/chart/chart";
import { useDispatch, useSelector } from "react-redux";
import { decimalSplit /* getPrecision */ } from "lib/price/decimalSplit";
import { RootState } from "reducers";
// import { CHART_DEFAULT_ITEM_COUNT } from "configure/chart";
import { useMediaQuery } from "react-responsive";
import { setLoading } from "reducers/loading";

const LWChart = ({ chartTime }) => {
    const dispatch = useDispatch();
    const { /* symbols,  */ chartList } = useSelector((state: RootState) => state.chart);
    const isMobile = useMediaQuery({ query: `(max-width: 760px)` });
    const isNarrowMobile = useMediaQuery({ query: `(max-width: 320px)` });

    const chart = useRef<IChartApi | null>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const series = useRef<ISeriesApi<'Candlestick'> | null>(null);

    const timeScale = {
        rightOffset: 2,
        barSpacing: isMobile ? (isNarrowMobile ? 3 : 5) : 8,
        // lockVisibleTimeRangeOnResize: false,
        // rightBarStaysOnScroll: false,
        // borderVisible: false,
        visible: true,
        timeVisible: chartTime === "15M" || chartTime === "4H" ? true : false,
        secondsVisible: false,
        tickMarkFormatter: (time) => {
            // console.log("time", time);
            const date = new Date(time * 1000);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hour = date.getHours();
            const min = date.getMinutes();
            return chartTime !== "15M"
                ? chartTime === "4H"
                    ? `${month}/${day}-${hour}`
                    : `${month}/${day}`
                : `${hour < 10 ? `0${hour}` : hour}:${min < 10 ? `0${min}` : `${min}`}`;
        },
        rightBarStaysOnScroll: true,
    };

    const options = {
        alignLabels: false,
        timeScale,
        rightPriceScale: {
            scaleMargins: {
                top: 0.2, // leave some space for the legend
                bottom: 0.05,
            },
            entireTextOnly: true,
            drawTicks: true,
        },
        // width: "100%",
        // height: "100%",
        layout: {
            background: { type: ColorType.Solid, color: "#131832" },
            textColor: "#B1BAD7",
            fontSize: isMobile ? 7 : 9,
        },
        grid: {
            vertLines: {
                color: "#131832",
            },
            horzLines: {
                color: "#131832",
            },
        },
        /* range: {
			from: chartList[0]?.time,
			to: chartList[chartList.length - 1]?.time,
		}, */
        crosshair: {
            mode: CrosshairMode.Normal,
        },
        business: {
            tickMarkFormatter: (time) => {
                return time["month"] + "/" + time["day"];
            },
        },
        handleScale: {
            mouseWheel: true,
            pinch: true,
            axisPressedMouseMove: true,
            pressedMouseMove: true,
            horzTouchDrag: true,
            vertTouchDrag: true,
        },
        handleScroll: true,
        kineticScroll: {
            touch: true,
            mouse: true,
        },
        trackingMouseMove: 1,
    };

    const handleResize = () => {
        if (chartContainerRef?.current) {
            const clientWidth = chartContainerRef.current.clientWidth;
            const cliendHeight = chartContainerRef.current.clientHeight;
            chart.current?.applyOptions({
                timeScale: {
                    ...timeScale,
                    barSpacing: clientWidth < 760 ? (clientWidth < 320 ? 3 : 5) : 8,
                },
                width: clientWidth,
                height: cliendHeight,
            });
        }
    };

    const onUpdated = () => {
        const data = series.current?.data();
        // console.log("data", data);

        if (!data || data.length === 0) { return; } 

        // console.log("loading false");

        dispatch(setLoading({ name: "chart", value: false }));

        const lastCandle = data[data.length - 1] as any;
        // console.log("chart", lastCandle);
        if (lastCandle) {
            dispatch(
                updateTooltip({
                    open: decimalSplit(lastCandle.open),
                    high: decimalSplit(lastCandle.high),
                    low: decimalSplit(lastCandle.low),
                    close: decimalSplit(lastCandle.close),
                })
            );
        }
    };

    useEffect(() => {
        // console.log("chart", lastCandle);
        if (chartList.length > 10) {
            // const lastCandle = chartList[chartList.length - 1];
            // dispatch(
            //     updateTooltip({
            //         open: decimalSplit(lastCandle.open),
            //         high: decimalSplit(lastCandle.high),
            //         low: decimalSplit(lastCandle.low),
            //         close: decimalSplit(lastCandle.close),
            //     })
            // );
            chart.current?.applyOptions({ ...options, timeScale });

            // console.log("chartList", chartList);
            series.current?.setData(chartList);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chartList]);

    // Resize chart on container resizes.
    useEffect(() => {
        chart.current = createChart(chartContainerRef.current, options);

        series.current = chart.current.addCandlestickSeries({
            upColor: "#13dfff",
            downColor: "#ff4976",
            borderDownColor: "#ff4976",
            borderUpColor: "#13dfff",
            wickDownColor: "#838ca1",
            wickUpColor: "#838ca1",
            priceFormat: {
                type: "custom",
                formatter: (priceValue) => decimalSplit(priceValue),
                minMove: 0.0000000001,
            },
        });

        // setCandleSeries(series);

        series.current.subscribeDataChanged(onUpdated);

        chart.current.subscribeCrosshairMove((param) => handleCrosshairMoved(param, chartList[chartList.length - 1]));

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            series.current.unsubscribeDataChanged(onUpdated);
            chart.current.remove();
        };
    }, []);

    let throttled;
    const handleCrosshairMoved = useCallback((param, lastCandle = undefined) => {
        // console.log("param", param, lastCandle);
        if ((!param.point || param.seriesData?.size < 1) && lastCandle) {
            // console.log("param", param, "lastCandle", lastCandle);
            // dispatch(updateLastRateData({ close: lastCandle.close }));
            dispatch(
                updateTooltip({
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
                try {
                    if (param.seriesData?.size === 0) {
                        return;
                    }

                    const obj = param.seriesData?.entries()?.next()?.value[1];
                    dispatch(
                        updateTooltip({
                            open: decimalSplit(obj.open),
                            high: decimalSplit(obj.high),
                            low: decimalSplit(obj.low),
                            close: decimalSplit(obj.close),
                        })
                    );
                } catch (error) {
                    console.log(error);
                }
            }, 0);
        }
    }, []);

    return <div ref={chartContainerRef} className="w-full h-full"></div>;
};

export default React.memo(LWChart);
