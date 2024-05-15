import pynths from "configure/coins/pynths";
import { subscribeOnStream, unsubscribeFromStream } from "./streaming";

const API_ENDPOINT = "https://benchmarks.pyth.network/v1/shims/tradingview";

// Use it to keep a record of the most recent bar on the chart
const lastBarsCache = new Map();

const datafeed = {
    chainId: '137',
    destination: null,
    selectedCoin: null, 
    searchPynths: (searchValue) => {
        searchValue = searchValue.includes("USD") ? searchValue.replace("USD", "") : searchValue;
        const filteredPynths = pynths[datafeed.chainId].filter(
            (e) =>
                    e.symbol.toLocaleLowerCase().includes(searchValue.toLowerCase()) ||
                    e.key.toLocaleLowerCase().includes(searchValue.toLowerCase())
        );
        return filteredPynths.map((e) => {
            return {
                symbol: e.symbol+"pUSD",
                full_name: "Crypto."+e.symbol+"/USD",
                description: "Pynth "+e.symbol+" / Pynth pUSD",
                exchange: "OnChain",
                ticker: "Crypto."+e.key+"/USD",
                type: e.categories[0],
            };
        });
    },
    onReady: (callback) => {
        console.debug("[onReady]: Method call");
        fetch(`${API_ENDPOINT}/config`).then((response) => {
            response.json().then((configurationData) => {
                setTimeout(() => callback(configurationData));
            });
        });
    },
    searchSymbols: (userInput, exchange, symbolType, onResultReadyCallback) => {
        console.debug("[searchSymbols]: Method call", userInput);
        const data = datafeed.searchPynths(userInput)

        console.debug("[searchSymbols]: Search result", data);
        onResultReadyCallback(data);
        /* fetch(`${API_ENDPOINT}/search?query=${userInput}`).then((response) => {
            response.json().then((data) => {
                console.log("[searchSymbols]: Search result", data);
                onResultReadyCallback(data);
            });
        }); */
    },
    resolveSymbol: (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
        console.debug("[resolveSymbol]: Method call", symbolName);
        fetch(`${API_ENDPOINT}/symbols?symbol=${symbolName}`).then((response) => {
            response
                .json()
                .then((symbolInfo) => {
                    console.debug("[resolveSymbol]: Symbol resolved", symbolInfo);
                    symbolInfo.description = 'p' + symbolInfo.name.replace('USD', '/pUSD');
                    symbolInfo.exchange = 'OnChain';

                    const symbol = symbolInfo.name.replace('USD', '');
                    symbolInfo['logo_urls'] = ['../images/currencies/pUSD.svg', '../images/currencies/p'+symbol+'.svg'];

                    onSymbolResolvedCallback(symbolInfo);

                    
                    console.debug("[resolveSymbol]: datafeed.destination", datafeed.destination?.key, symbol);
                    if ( datafeed.destination && datafeed.destination.key !== symbol) {
                        const idx = pynths[datafeed.chainId].findIndex((e) => e.key === symbol);
                        const selCoin = {...pynths[datafeed.chainId][idx]};
                        datafeed.selectedCoin && datafeed.selectedCoin(selCoin, 'destination');
                    }
                })
                .catch((error) => {
                    console.log("[resolveSymbol]: Cannot resolve symbol", symbolName);
                    onResolveErrorCallback("Cannot resolve symbol");
                    return;
                });
        });
    },
    getBars: (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
        const { from, to, firstDataRequest } = periodParams;
        console.debug("[getBars]: Method call", symbolInfo, resolution, from, to);
        fetch(
            `${API_ENDPOINT}/history?symbol=${symbolInfo.ticker}&from=${periodParams.from}&to=${periodParams.to}&resolution=${resolution}`
        ).then((response) => {
            response
                .json()
                .then((data) => {
                    if (data.t.length === 0) {
                        onHistoryCallback([], { noData: true });
                        return;
                    }
                    const bars = [];
                    for (let i = 0; i < data.t.length; ++i) {
                        bars.push({
                            time: data.t[i] * 1000,
                            low: data.l[i],
                            high: data.h[i],
                            open: data.o[i],
                            close: data.c[i],
                        });
                    }
                    if (firstDataRequest) {
                        lastBarsCache.set(symbolInfo.ticker, {
                            ...bars[bars.length - 1],
                        });
                    }
                    onHistoryCallback(bars, { noData: false });
                })
                .catch((error) => {
                    console.log("[getBars]: Get error", error);
                    onErrorCallback(error);
                });
        });
    },
    subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) => {
        console.debug("[subscribeBars]: Method call with subscriberUID:", subscriberUID);
        subscribeOnStream(
            symbolInfo,
            resolution,
            onRealtimeCallback,
            subscriberUID,
            onResetCacheNeededCallback,
            lastBarsCache.get(symbolInfo.ticker)
        );
    },
    unsubscribeBars: (subscriberUID) => {
        console.debug("[unsubscribeBars]: Method call with subscriberUID:", subscriberUID);
        unsubscribeFromStream(subscriberUID);
    },
};

export default datafeed;
