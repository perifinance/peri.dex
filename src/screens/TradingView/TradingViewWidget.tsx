// TradingViewWidget.jsx

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "reducers";
import {
    widget,
    ChartingLibraryWidgetOptions,
    LanguageCode,
    ResolutionString,
    IChartingLibraryWidget,
    IChartWidgetApi,
    Timezone,
    ChartingLibraryFeatureset,
} from "charting_library";
import datafeed from "lib/datafeed/datafeed";
import { setChartInterval } from "lib/datafeed";
// import { toBigInt } from "lib/bigInt";
// import { updateCoin } from "reducers/coin/coinList";
// import { updateLastRateData } from "reducers/rates";
import { useMediaQuery } from "react-responsive";

const getLanguageFromURL = (): LanguageCode | null => {
    const regex = new RegExp("[\\?&]lang=([^&#]*)");
    const results = regex.exec(window.location.search);
    return results === null ? null : (decodeURIComponent(results[1].replace(/\+/g, " ")) as LanguageCode);
};

export default function TradingViewWidget({setSelectedCoin, isBuy}) {
    // const dispatch = useDispatch();
    const { coinList } = useSelector((state: RootState) => state.coinList);
    const { networkId, isConnect } = useSelector((state: RootState) => state.wallet);

    const [tvWidget, setTvWidget] = useState<IChartingLibraryWidget>(null);
    const [chart, setChart] = useState<IChartWidgetApi>(null);

    const { destination } = useSelector((state: RootState) => state.selectedCoin);
    const [feeder, setFeeder] = useState(null);
    const isMobile = useMediaQuery({ query: `(max-width: 760px)` });
    // const isNarrowMobile = useMediaQuery({ query: `(max-width: 320px)` });

    const createWidget = () => {
        const enabled_features = ["show_symbol_logos"] as ChartingLibraryFeatureset[]
        const disabled_features = [
            "create_volume_indicator_by_default",
            "header_quick_search",
            "header_compare",
            "timeframes_toolbar",
            "header_symbol_search",
            "symbol_info"
        ] as ChartingLibraryFeatureset[];

        isMobile && enabled_features.push("hide_left_toolbar_by_default");

        const widgetOptions: ChartingLibraryWidgetOptions = {
            container: "tv_chart_container",
            symbol: `${destination.symbol ? destination.symbol.substring(1) : "BTC"}USD`,
            interval: "15" as ResolutionString,
            library_path: "charting_library/",
            locale: getLanguageFromURL() || "en",
            datafeed: datafeed,
            autosize: true,
            debug: false,
            theme: "dark",
            custom_css_url: "../css/widget.css",
            toolbar_bg: "#131832",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone as Timezone, // 'Etc/UTC',
            overrides: {
                "paneProperties.backgroundType": "gradient",
                "paneProperties.backgroundGradientEndColor": "#042044",
                "paneProperties.backgroundGradientStartColor": "#01092c",
            },
            enabled_features,
            disabled_features,
        };

        const tvWidget = new widget(widgetOptions);
        tvWidget.onChartReady(() => {
            const overridesOptions = {
                "symbolWatermarkProperties.color": "#131832",
                "scalesProperties.lineColor": "#131832",
                "scalesProperties.textColor": "#838ca1",
                "mainSeriesProperties.candleStyle.upColor": "#13dfff",
                "mainSeriesProperties.candleStyle.downColor": "#ff4976",
                "mainSeriesProperties.candleStyle.drawWick": true,
                "mainSeriesProperties.candleStyle.drawBorder": true,
                "mainSeriesProperties.candleStyle.borderColor": "#838ca1",
                "mainSeriesProperties.candleStyle.borderUpColor": "#13dfff",
                "mainSeriesProperties.candleStyle.borderDownColor": "#ff4976",
                "mainSeriesProperties.candleStyle.wickUpColor": "#838ca1",
                "mainSeriesProperties.candleStyle.wickDownColor": "#838ca1",
                "mainSeriesProperties.candleStyle.barColorsOnPrevClose": false,
            };
            isMobile 
                ? (overridesOptions["mainSeriesProperties.minTick"] = "100, 1, true")
                : (overridesOptions["mainSeriesProperties.minTick"] = "10000, 1, true");
            
            tvWidget.applyOverrides(overridesOptions);
            const chart = tvWidget.chart();
            chart.createStudy('Moving Average Double');

            tvWidget.activeChart().onIntervalChanged().subscribe(null, (interval) =>{
                setChartInterval(interval);
            });
            /*chart.getSeries().setChartStyleProperties(1, {
                upColor: "#13dfff",
                downColor: "#ff4976",
                borderDownColor: "#ff4976",
                borderUpColor: "#13dfff",
                wickDownColor: "#838ca1",
                wickUpColor: "#838ca1",
            }); */
            setChart(chart);
            // tvWidget.headerReady().then(() => {
            // 	const button = tvWidget.createButton();
            // 	button.setAttribute('title', 'Click to show a notification popup');
            // 	button.classList.add('apply-common-tooltip');
            // 	button.addEventListener('click', () => tvWidget.showNoticeDialog({
            // 			title: 'Notification',
            // 			body: 'TradingView Charting Library API works correctly',
            // 			callback: () => {
            // 				console.log('Noticed!');
            // 			},
            // 		}));
            // 	button.innerHTML = 'Check API';
            // });
            // tvWidget.hideAllDrawingTools();

            /* const priceScale = tvWidget.activeChart().getPanes()[0].getMainSourcePriceScale();
            priceScale.setAutoScale(true) */
        });

        setTvWidget(tvWidget);
    };

    /* const updatePrice = (data) => {
        if (coinList.length === 0) return;

        try {
            const keys = data?.id?.split(".")[1].split("/");

            const idxFind = coinList.findIndex((e) => e.key === keys[0]);
            if (idxFind === -1 || keys[1] !== "USD") {
                // console.log("updatePrice", idxFind, keys, coinList[idxFind]);
                return;
            }

            const bnPrice = toBigInt(data.p);
            const newCoin = {
                ...coinList[idxFind],
                price: bnPrice,
                // change: data.change,
                timestamp: data.t,
            };
            dispatch(updateCoin(newCoin));

            if (isConnect && destination.symbol === coinList[idxFind].symbol) {
                const lastRateData = {
                    timestamp: data.t,
                    rate: bnPrice,
                    symbols: data?.id?.split(".")[1],
                };
                // console.log("lastRateData", lastRateData);
                dispatch(updateLastRateData(lastRateData));
            }
        } catch (err) {
            console.error(err);
        }
    }; */

    useEffect(() => {
        // coinList.length && setUpdatePriceCallBack(updatePrice);
        if (chart && destination?.symbol) {
            // feeder.destination = destination;

            const symbol = `${destination.symbol ? destination.symbol.substring(1) : "BTC"}USD`;

            if (chart.symbolExt()?.symbol === symbol) return;

            chart.setSymbol(symbol, () => {
                // console.log("setSymbol");
            });
            chart.onSymbolChanged().subscribe(null, () => {
                feeder.destination = destination;
            });
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [destination?.symbol, coinList.length, isConnect]);

    useEffect(() => {
        const overridesOptions = {};
        isBuy 
                ? (overridesOptions["paneProperties.backgroundGradientEndColor"] = "#042044")
                : (overridesOptions["paneProperties.backgroundGradientEndColor"] = "#221237");
        tvWidget && tvWidget.applyOverrides(overridesOptions);
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isBuy]);

    useEffect(() => {
        if (feeder && feeder.chainId !== networkId ){
            feeder.chainId = networkId 
                ? networkId.toString() 
                : process.env.REACT_APP_DEFAULT_NETWORK_ID;
            
            feeder.setSelectedCoin = setSelectedCoin;
        }
    }, [networkId, feeder, destination]);

    useEffect(() => {
        createWidget();
        datafeed.destination = destination;
        setFeeder(datafeed);

        return () => tvWidget && tvWidget.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="tradingview-widget-container w-full h-full rounded-lg">
            <div className="w-full h-full rounded-lg" id="tv_chart_container" />
        </div>
    );
}
