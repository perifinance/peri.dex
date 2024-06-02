/* eslint-disable react-hooks/exhaustive-deps */
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
import { useMediaQuery } from "react-responsive";
import useSelectedCoin from "hooks/useSelectedCoin";

const getLanguageFromURL = (): LanguageCode | null => {
    const regex = new RegExp("[\\?&]lang=([^&#]*)");
    const results = regex.exec(window.location.search);
    return results === null ? null : (decodeURIComponent(results[1].replace(/\+/g, " ")) as LanguageCode);
};

export default function TradingViewWidget({isBuy}) {
    // const dispatch = useDispatch();
    const { coinList } = useSelector((state: RootState) => state.coinList);
    const { networkId, isConnect } = useSelector((state: RootState) => state.wallet);
    // const { destination } = useSelector((state: RootState) => state.selectedCoin);
    const [tvWidget, setTvWidget] = useState<IChartingLibraryWidget>(null);
    const [chart, setChart] = useState<IChartWidgetApi>(null);
    const [feeder, setFeeder] = useState(null);
    const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

    const [{ selectedCoins }, setSelectedCoin] = useSelectedCoin();
    const { destination } = selectedCoins;

    const isRunningInMetamask = /MetaMask/i.test(navigator.userAgent) || /imToken/i.test(navigator.userAgent) || /Kakao/i.test(navigator.userAgent);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    const [symbol, setSymbol] = useState("BTCUSD");
    const [hasError, setHasError] = useState(false);
    const [iframeSrc, setIframeSrc] = useState("");
    // const iframeRef = useRef<HTMLIFrameElement>(null);

    const enabled_features = ["show_symbol_logos"] as ChartingLibraryFeatureset[];
    const disabled_features = [
        "create_volume_indicator_by_default",
        "header_quick_search",
        "header_compare",
        "timeframes_toolbar",
        "header_symbol_search",
        "symbol_info"
    ] as ChartingLibraryFeatureset[];
    isMobile && enabled_features.push("hide_left_toolbar_by_default");

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

    const createWidget = () => {
        const widgetOptions: ChartingLibraryWidgetOptions = {
            container: "tv_chart_container",
            symbol,
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
            
            tvWidget.applyOverrides(overridesOptions);
            const chart = tvWidget.chart();
            chart.createStudy('Moving Average Double');

            tvWidget.activeChart().onIntervalChanged().subscribe(null, (interval) =>{
                setChartInterval(interval);
            });
            setChart(chart);
        });

        setTvWidget(tvWidget);
    };

    useEffect(() => {
        const params = new URLSearchParams({
            symbol,
            interval: "15",
            library_path: "charting_library/",
            locale: "en",
            theme: "dark",
            backgroundColor: "#021135",
            // hide_top_toolbar: "true",
            // hide_side_toolbar: "false",
            allow_symbol_change: "false",
            studies: "BB@tv-basicstudies",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            // enabled_features: JSON.stringify(enabled_features),
            disabled_features: JSON.stringify(disabled_features),
            overrides: JSON.stringify({
                ...overridesOptions, 
                "paneProperties.backgroundType": "gradient",
                "paneProperties.backgroundGradientEndColor": "#042044",
                "paneProperties.backgroundGradientStartColor": "#01092c"
            })
        });
        
        setIframeSrc(`https://www.tradingview.com/widgetembed/?${params.toString()}`);
    }, [symbol]);

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
        } else if (isRunningInMetamask) {
            const symbol = `PYTH:${destination.symbol ? destination.symbol.substring(1) : "PYTH:BTC"}USD`;
            setSymbol(symbol);
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [destination?.symbol, coinList.length, isConnect]);

    useEffect(() => {
        const overridesOptions = {};
        isBuy 
                ? (overridesOptions["paneProperties.backgroundGradientEndColor"] = "#042044")
                : (overridesOptions["paneProperties.backgroundGradientEndColor"] = "#221237");
        tvWidget?.applyOverrides(overridesOptions);
        
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
        if (!isScriptLoaded) return;

        try {
            createWidget();
        } catch (err) {
            setHasError(true);
        }
        setFeeder(datafeed);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isScriptLoaded]);


    useEffect(() => {
        const script = document.createElement("script");
        script.src = "charting_library/charting_library.js"; // replace with the correct path
        script.onload = () => setIsScriptLoaded(true);
        document.body.appendChild(script);

        datafeed.destination = destination;


        return () => {
            document.body.removeChild(script);
            
            tvWidget?.remove();
            setTvWidget(null);
            setFeeder(null);
        };
    }, []);


    if (isRunningInMetamask) {
        return (
            <div className="tradingview-widget-container w-full h-full rounded-lg">
                <iframe
                    title="TradingView Widget"
                    src={iframeSrc}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allowFullScreen
                />
            </div>
        )
    }

    if (hasError) {
        return (
            <div className="tradingview-widget-container w-full h-full rounded-lg my-auto mx-auto">
                <p >Failed to load TradingView widget. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="tradingview-widget-container w-full h-full rounded-lg">
            <div className="w-full h-full rounded-lg" id="tv_chart_container" />
        </div>
    );
    
}