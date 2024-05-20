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
import "css/Chart.css";

const Chart = () => {
    const dispatch = useDispatch();

    const selectedCoins = useSelector((state: RootState) => state.selectedCoin);
    const { lastRateData } = useSelector((state: RootState) => state.exchangeRates);
    const { tooltip } = useSelector((state: RootState) => state.chart);

    const [chartTime, setChartTime] = useState("15M");
    const [currencyNames, setCurrencyNames] = useState<{ source: String; destination: String }>(null);
    const [chartData, setChartData] = useState({ source: [], destination: [] });
    const [isTimeSeriseList, setIsTimeSeriseList] = useState(false);
    const isNarrowMobile = useMediaQuery({ query: `(max-width: 320px)` });
    const timeSerise = { "15M": "15m", "4H": "4h", "24H": "1d", "1W": "1w" };
    const color_tailwind = tooltip.open < tooltip.close ? "text-cyan-400" : "text-red-400";

    const loadingHandler = useCallback(
        (toggle: boolean) => {
            toggle
                ? dispatch(setLoading({ name: "chart", value: true }))
                : dispatch(setLoading({ name: "chart", value: false }));
        },
        [dispatch]
    );

    const setPrepareData = async (data: any, sliceLength): Promise<any> => {
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
            ? await data.data.slice(sliceLength, data.data.length).map((candle) => {
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
            : [];
        // console.log("dataList",key, dataList);
        return dataList;
    };

    const init = useCallback(async () => {
        let interval = "";
        let sliceLength = 0; // cutting data length

        interval = timeSerise[chartTime];

        const rawData: any = {};
        Object.keys(currencyNames).forEach(async (key) => {
            loadingHandler(true);
            // console.log("loading true");
            const symbol = currencyNames[key].replace("p", "");
            const url = `${process.env.REACT_APP_PER_API_URL}binance`;
            // console.log("url", url, symbol, interval);
            if (currencyNames[key] !== "pUSD") {
                const retData = await axios.get(url, {
                    headers: { "Access-Control-Allow-Origin": "*" },
                    params: { symbol: symbol, interval: interval },
                });
                // console.log("data", retData);
                rawData[key] = await setPrepareData(retData, sliceLength);
                if (rawData.source && rawData.destination) {
                    setChartData(rawData);
                }
            } else {
                // console.log("pUSD");
                rawData[key] = await setPrepareData(undefined, sliceLength);
            }
        });
    }, [chartTime, currencyNames]);

    useEffect(() => {
        setCurrencyNames({
            source: getSafeSymbol(selectedCoins.source.symbol),
            destination: getSafeSymbol(selectedCoins.destination.symbol, false),
        });
    }, [selectedCoins]);

    useEffect(() => {
        // loadingHandler(true);

        // console.log("currencyNames", currencyNames);
        if (currencyNames && chartTime) {
            init();
        }
    }, [init]);

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
        <div className="w-full h-full">
            <div className="flex flex-col relative w-full h-full items-center">
                <div
                    className={`flex flex-row w-full md:w-[95%] absolute justify-start xs:justify-between text-xs xs:pr-14 sm:pr-[60px] md:ml-0 lg:ml-0 ${
                        isNarrowMobile ? "pr-2" : null
                    }`}
                >
                    <div className={`lg:flex flex-col z-10 w-fit`}>
                        <div className={`flex flex-nowrap w-fit space-x-1 p-1`}>
                            <div className="flex flex-row items-end lg:justify-items-start h-8">
                                <div className="w-8 h-6 relative mt-1">
                                    <img
                                        className="w-5 h-5 md:w-6 left-0 absolute z-[1]"
                                        src={`/images/currencies/${getSafeSymbol(
                                            selectedCoins.destination.symbol,
                                            false
                                        )}.svg`}
                                        alt="currencies"
                                    ></img>
                                    <img
                                        className="w-5 h-5 md:w-6 left-[10px] absolute z-0"
                                        src={`/images/currencies/${getSafeSymbol(selectedCoins.source.symbol)}.svg`}
                                        alt="currencies"
                                    ></img>
                                </div>
                                <div className="flex flex-row flex-nowrap w-fit items-end space-x-2 text-base font-medium tracking-tighter">
                                    <div className="flex flex-row flex-nowrap text-sm lg:text-base">
                                        <span className="text-nowrap">
                                            {getSafeSymbol(selectedCoins.destination.symbol, false)}
                                        </span>
                                        <span> / </span>
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
                                <span className="font-medium hidden md:block w-3">O:</span>
                                <span className={`${color_tailwind}`}>{` ${tooltip.open}`}</span>
                            </span>
                            <span className="flex flex-nowrap">
                                <span className="font-medium hidden md:block w-3">H:</span>
                                <span className={`${color_tailwind}`}>{` ${tooltip.high}`}</span>
                            </span>
                            <span className="flex flex-nowrap">
                                <span className="font-medium hidden md:block w-3">L:</span>
                                <span className={`${color_tailwind}`}>{` ${tooltip.low}`}</span>
                            </span>
                            <span className="flex flex-nowrap">
                                <span className="font-medium hidden md:block w-3">C:</span>
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
                                className={`absolute items-center text-gray-300 text-xs font-medium bg-blue-850 w-10
                                shadow-sm shadow-slate-600 ${!isTimeSeriseList && "hidden"}`}
                                ref={seriseRef}
                            >
                                <ul className="list-reset">
                                    {Object.keys(timeSerise).map((key) => (
                                        <li
                                            key={key}
                                            className={`text-center p-1 hover:text-sky-200/80 bg-blue-950 cursor-pointer ${
                                                chartTime === key
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
                <div className="flex h-full w-[97%] lg:w-full z-2 mt-[5px] ml-2 lg:ml-0 lwchart">
                    <BarCandleChart source={chartData.source} destinate={chartData.destination} chartTime={chartTime} />
                </div>
            </div>
        </div>
    );
};
export default Chart;
