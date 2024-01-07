import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "reducers";
import { setLoading } from "reducers/loading";
import BarCandleChart from "screens/Chart/CandleStick";
import axios from "axios";
import { getSafeSymbol } from "lib/coinList";
import { formatCurrency } from "lib";
import { useMediaQuery } from "react-responsive";
// import { getLastRates } from "lib/thegraph/api";

const Chart = () => {
    const dispatch = useDispatch();

    const selectedCoins = useSelector((state: RootState) => state.selectedCoin);
    const { lastRateData } = useSelector((state: RootState) => state.exchangeRates);
    const { tooltip } = useSelector((state: RootState) => state.chart);

    const [chartTime, setChartTime] = useState("15M");
    const [currencyNames, setCurrencyNames] = useState<{ source: String; destination: String }>();
    const [source, setSource] = useState([]);
    const [destinate, setDestinate] = useState([]);
    const [isTimeSeriseList, setIsTimeSeriseList] = useState(false);
    const isNarrowMobile = useMediaQuery({ query: `(max-width: 320px)` });
    const timeSerise = { "15M": "15m", "4H": "4h", "24H": "1d", "1W": "1w" };
    const color_tailwind = tooltip.open < tooltip.close ? "text-cyan-400" : "text-red-400";

    const loadingHandler = useCallback(
        (toggle: boolean) => {
            toggle
                ? dispatch(setLoading({ name: "balance", value: true }))
                : dispatch(setLoading({ name: "balance", value: false }));
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
            ?   await data.data.slice(sliceLength, data.data.length).map((candle) => {
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
            :   [];
        // console.log("dataList",key, dataList);
        if (key === "source") {
            setSource(dataList);
        } else if (key === "destination") {
            setDestinate(dataList);
        }
    }, []);

    const init = useCallback(async () => {
        let interval = "";
        let sliceLength = 0; // cutting data length

        interval = timeSerise[chartTime];

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
                        // console.log(res);
                        setPrepareData(res, key, sliceLength);
                        loadingHandler(false);
                    });

                // runTimer(url, symbol, interval, key, sliceLength);
            } else {
                // console.log("pUSD");
                setPrepareData(undefined, key, sliceLength);
            }
        });
    }, [chartTime, currencyNames, setPrepareData]);

    useEffect(() => {
        setCurrencyNames({
            source: getSafeSymbol(selectedCoins.source.symbol),
            destination: getSafeSymbol(selectedCoins.destination.symbol, false),
        });
    }, [selectedCoins]);

    useEffect(() => {
        loadingHandler(true);

        if (currencyNames) {
            init();
        }
    }, [currencyNames, chartTime, loadingHandler, init]);

    const seriseRef = useRef<HTMLDivElement>(null);

    const closeModalHandler = useCallback(
        (e) => {
            if (isTimeSeriseList && e.target.id !== "series-caller" && !seriseRef.current.contains(e.target)) {
                setIsTimeSeriseList(false);
            }
        },
        [isTimeSeriseList]
    );

    useEffect(() => {
        window.addEventListener("click", closeModalHandler);

        return () => {
            window.removeEventListener("click", closeModalHandler);
        };
    }, [closeModalHandler]);

    return (
        <div className="w-full bg-gray-700 rounded-t-lg lg:rounded-lg lg:max-h-screen min-h-[45vh] lg:min-h-[36%] lg:px-5 lg:py-4 ">
            <div className="flex flex-col relative w-full h-full items-center">
                {/* <div className="relative flex justify-end mr-20 ">
                    
                </div> */}
                <div className={`flex flex-row w-full md:w-[95%] absolute justify-start xs:justify-between text-xs xs:pr-14 sm:pr-[60px] md:ml-0 lg:ml-0 ${isNarrowMobile?"pr-2":null}`}>
                    <div className={`lg:flex flex-col z-10 w-fit`}>
                        <div className={`flex flex-nowrap w-fit space-x-1 p-1`}>
                            <div className="flex flex-row items-end lg:justify-items-start h-8">
                                <div className="w-10 h-6 relative mt-1">
                                    <img
                                        className="w-5 h-5 md:w-6 lg:h-6 ml-1 absolute bottom-left z-1"
                                        src={`/images/currencies/${getSafeSymbol(
                                            selectedCoins.destination.symbol,
                                            false
                                        )}.svg`}
                                        alt="currencies"
                                    ></img>
                                    <img
                                        className="w-5 h-5 md:w-6 lg:h-6 ml-4 absolute bottom-right z-10"
                                        src={`/images/currencies/${getSafeSymbol(selectedCoins.source.symbol)}.svg`}
                                        alt="currencies"
                                    ></img>
                                </div>
                                <div className="flex flex-row flex-nowrap w-fit items-end space-x-2 text-base font-medium tracking-tighter">
                                    <div className="flex flex-row flex-nowrap text-sm lg:text-base">
                                        <span className="text-nowrap">
                                            {getSafeSymbol(selectedCoins.destination.symbol, false)}
                                        </span>
                                        <span> /{" "}</span>
                                        <span className="text-nowrap">
                                            {getSafeSymbol(selectedCoins.source.symbol)}
                                        </span>
                                    </div>
                                    <span className="text-[10px] md:text-xs text-skyblue-500">
                                        {formatCurrency(lastRateData.rate, 8)} 
                                    </span>
                                    <span className="text-[10px] md:text-xs text-skyblue-500 hidden lg:block">
                                        {getSafeSymbol(selectedCoins.source.symbol)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* TOOLTIP */}
                        <div className="flex w-fit items-center h-3 md:h-5 text-[8px] md:text-[10px] space-x-2 justify-between ml-2 lg:mx-2 lg:ml-3 z-20">
                            <span className="flex flex-nowrap">
                                <span className="font-medium hidden md:block">O:</span>
                                <span className={`${color_tailwind}`}>{` ${tooltip.open}`}</span>
                            </span>
                            <span className="flex flex-nowrap">
                                <span className="font-medium hidden md:block">H:</span>
                                <span className={`${color_tailwind}`}>{` ${tooltip.high}`}</span>
                            </span>
                            <span className="flex flex-nowrap">
                                <span className="font-medium hidden md:block">L:</span>
                                <span className={`${color_tailwind}`}>{` ${tooltip.low}`}</span>
                            </span>
                            <span className="flex flex-nowrap">
                                <span className="font-medium hidden md:block">C:</span>
                                <span className={`${color_tailwind}`}>{` ${tooltip.close}`}</span>
                            </span>
                        </div>
                    </div>
                    <div className="relative flex justify-end w-fit">
                        <div className="flex z-20 mt-3 text-md">
                            <button
                                id="series-caller"
                                className={`flex items-end justify-center hover:border border-gray-300 w-10 h-5
                                text-gray-300 text-sky-200/80 font-medium text-xs rounded-md 
                                ${isTimeSeriseList && " border rounded-b-none"}`}
                                onClick={() => setIsTimeSeriseList(!isTimeSeriseList)}
                            >
                                {chartTime}
                                <img
                                    id="series-caller"
                                    alt="arrow"
                                    className={`w-2 pb-[6px] pl-[2px] ${isTimeSeriseList && " hidden"}`}
                                    src={`/images/icon/bottom_arrow.png`}
                                ></img>
                            </button>
                            <div
                                className={`absolute items-center text-gray-300 text-xs font-medium bg-gray-700 w-10
                                shadow-sm shadow-slate-600 ${!isTimeSeriseList && "hidden"}`}
                                ref={seriseRef}
                            >
                                <ul className="list-reset">
                                    {Object.keys(timeSerise).map((key) => (
                                        <li
                                            key={key}
                                            className={`text-center p-1 hover:text-sky-200/80 hover:bg-black-900 cursor-pointer ${
                                                chartTime === key && "bg-black-900"
                                            }`}
                                            onClick={() => {
                                                setChartTime(key);
                                                setIsTimeSeriseList(!isTimeSeriseList);
                                            }}
                                        >
                                            {key}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex h-full w-[97%] lg:w-full lg:h-[26rem] z-2 mt-[5px] ml-2 lg:ml-0">
                    <BarCandleChart source={source} destinate={destinate} chartTime={chartTime} />
                </div>
            </div>
        </div>
    );
};
export default Chart;
