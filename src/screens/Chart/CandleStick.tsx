import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateChart, setChartBase, addChartData } from "reducers/chart/chart";
import LWchart from "./LWchart";
import { RootState } from "reducers";
import { CHART_DEFAULT_ITEM_COUNT } from "configure/chart";
import coinList from "reducers/coin/coinList";

const dummy = { open: "1", low: "1", high: "1", close: "1" };
const TimeSerise = {
    "15M": 15 * 60,
    "1H": 60 * 60,
    "4H": 4 * 60 * 60,
    "24H": 24 * 60 * 60,
    "1W": 7 * 24 * 60 * 60,
    "1M": 30 * 24 * 60 * 60,
};

const BarCandleChart = ({ currencyNames, source, destinate, chartTime }) => {
    const dispatch = useDispatch();
    const selectedCoin = useSelector((state: RootState) => state.selectedCoin);
    const { chartList } = useSelector((state: RootState) => state.chart);
    const { lastRateData } = useSelector((state: RootState) => state.exchangeRates);

    const mergeData = useCallback(() => {
        const values = [];
        const datas = source.length === 0 ? destinate : source;

        datas.forEach((item, index) => {
            const destinationDataItem = destinate[index] ? destinate[index] : destinate[destinate.length - 1] ?? dummy;
            const sourceDataItem = source[index] ? source[index] : source[source.length - 1] ?? dummy;

            // console.log("mergeData", item, index, destinationDataItem, sourceDataItem);

            values[index] = {
                ...item,
                low: String(destinationDataItem.low / sourceDataItem.low),
                close: String(destinationDataItem.close / sourceDataItem.close),
                high: String(destinationDataItem.high / sourceDataItem.high),
                open: String(destinationDataItem.open / sourceDataItem.open),
                timestamp: source ? source.openTime : destinate.openTime,
            };
        });

        return values;
    }, [destinate, source]);

    const changeLastData = (chartList, lastRateData) => {

        try {
            if (lastRateData === undefined) {
                return;
            }

            let chartLastData = { ...chartList[chartList.length - 1] };

            console.log("chartLastData", chartLastData);
            const lastPrice = (Number((lastRateData.rate * 10n ** 10n) / 10n ** 18n) / 10 ** 10).toString();

            const lastChartTime = lastRateData.timestamp - (lastRateData.timestamp % TimeSerise[chartTime]);
            console.log("lastPrice", chartTime, chartLastData.time, lastChartTime);
            if (chartLastData.time < lastChartTime) {
                chartLastData = {
                    ...chartLastData,
                    time: lastChartTime,
                    close: lastPrice,
                    high: lastPrice,
                    low: lastPrice,
                    open: lastPrice,
                    openTime: lastChartTime * 1000,
                };
                console.log("addChartData addChartData", chartLastData);
                dispatch(addChartData({ symbols: lastRateData.symbols, chartLastData }));
            } else if (chartLastData.time === lastChartTime) {
                if (Number(chartLastData.high) < Number(lastPrice)) {
                    chartLastData.high = lastPrice;
                } else if (Number(chartLastData.low) > Number(lastPrice)) {
                    chartLastData.low = lastPrice;
                }
                chartLastData.close = lastPrice;

                if (lastRateData.symbols === `${selectedCoin.source.symbol}/${selectedCoin.destination.symbol}`) {
                    console.log("dispatch updateChart", chartLastData);
                    dispatch(updateChart({ symbols: lastRateData.symbols, chartLastData }));
                }
            }

            return;
        } catch (error) {
            console.log(error);
        }
        return;
    };

    useEffect(() => {
        const prepareData = mergeData() ?? [];
        const chartList = prepareData.map((el) => {
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

        const symbols = `${selectedCoin.source.symbol}/${selectedCoin.destination.symbol}`;
        dispatch(setChartBase({ symbols, chartList }));
        console.log("dispatch chartData", chartList);
        if (chartList.length === CHART_DEFAULT_ITEM_COUNT) {
            setTimeout(changeLastData, 10, chartList, lastRateData);
        }
    }, [mergeData]);

    useEffect(() => {
        chartList.length > CHART_DEFAULT_ITEM_COUNT ?? changeLastData(chartList, lastRateData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastRateData]);

    return <LWchart chartTime={chartTime} />;
};

export default BarCandleChart;
