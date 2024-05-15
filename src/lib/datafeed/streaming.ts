// Assuming you're working in a browser environment that supports fetch and ReadableStrea
const streamingUrl = "https://benchmarks.pyth.network/v1/shims/tradingview/streaming";
const channelToSubscription = new Map();
let fnUpdatePrice = null;

export const setUpdatePriceCallBack = (fn) => fnUpdatePrice = fn; 

function handleStreamingData(data) {
    const { id, p, t } = data;

    const channelString = id;
    const subscriptionItem = channelToSubscription.get(channelString);

    if (fnUpdatePrice) {
        fnUpdatePrice({id, p, t});
    }

    if (!subscriptionItem) {
        return;
    }

    // console.debug("[stream] handleStreamingData:", data);

    const tradePrice = p;
    const tradeTime = t * 1000; // Multiplying by 1000 to get milliseconds
    // console.debug("[stream] handleStreamingData:", tradeTime);

    const lastDailyBar = subscriptionItem.lastDailyBar;
    // console.debug("[stream] handleStreamingData:", id, subscriptionItem);
    const nextDailyBarTime = getNextDailyBarTime(lastDailyBar.time);

    let bar;
    if (tradeTime >= nextDailyBarTime) {
        // const day = 60*60*24*1000;
        bar = {
            time: /* tradeTime - nextDailyBarTime > day ? getNextDailyBarTime(nextDailyBarTime): */ nextDailyBarTime,
            open: tradePrice,
            high: tradePrice,
            low: tradePrice,
            close: tradePrice,
        };
        // console.debug("[stream] Generate new bar", tradeTime, bar);
    } else {
        bar = {
            ...lastDailyBar,
            high: Math.max(lastDailyBar.high, tradePrice),
            low: Math.min(lastDailyBar.low, tradePrice),
            close: tradePrice,
        };
        // console.debug("[stream] Update the latest bar by price", tradePrice);
    }

    const paramBar = {...bar};

    // Send data to every subscriber of that symbol
    subscriptionItem.handlers.forEach((handler) => handler.callback(paramBar));

    subscriptionItem.lastDailyBar = bar;
    
    channelToSubscription.set(channelString, subscriptionItem);

}

function startStreaming(retries = 3, delay = 3000) {
    fetch(streamingUrl)
        .then((response) => {
            const reader = response.body.getReader();
            const utfDecoder = new TextDecoder("utf-8");

            function streamData(remain = "") {
                reader
                    .read()
                    .then(({ value, done }) => {
                        if (done) {
                            console.error("[stream] Streaming ended.");
                            return;
                        }

                        let brokenJson = "";
                        // Assuming the streaming data is separated by line breaks
                        const dataStrings =utfDecoder.decode(value, { stream: true }).split("\n");
                        dataStrings.forEach((dataString, idx) => {
                            const lineData = dataString?.trim();
                            const trimmedDataString = idx === 0 && remain !== "" && !lineData.startsWith("{")
                                ? remain.trim() + lineData
                                : lineData;

                            // if (idx === 0 && remain !== "") console.log("[stream] fix broken chunk:", trimmedDataString);
                            if (trimmedDataString && trimmedDataString.startsWith("{")) {
                                try {
                                    var jsonData = JSON.parse(trimmedDataString);
                                    // console.debug("[stream] handleStreamingData:", jsonData)
                                    handleStreamingData(jsonData);
                                } catch (e) {
                                    if (idx === dataStrings.length - 1) {
                                        // console.debug("[stream] broken chunk data:", trimmedDataString, idx);
                                        brokenJson = trimmedDataString;
                                    } else {
                                        console.error("Error parsing JSON:", e.message);
                                    }
                                }
                            }
                        });

                        streamData(brokenJson); // Continue processing the stream
                    })
                    .catch((error) => {
                        console.error("[stream] Error reading from stream:", error);
                        attemptReconnect(retries, delay);
                    });
            }

            streamData();
        })
        .catch((error) => {
            console.error("[stream] Error fetching from the streaming endpoint:", error);
        });
    function attemptReconnect(retriesLeft, delay) {
        if (retriesLeft > 0) {
            console.debug(`[stream] Attempting to reconnect in ${delay}ms...`);
            setTimeout(() => {
                startStreaming(retriesLeft - 1, delay);
            }, delay);
        } else {
            console.error("[stream] Maximum reconnection attempts reached.");
        }
    }
}

function getNextDailyBarTime(barTime) {
    const date = new Date(barTime/*  * 1000 */);
    // console.debug("[stream] Next daily bar time(today):", date);
    date.setDate(date.getDate() + 1);
    // console.debug("[stream] Next daily bar time:", barTime, date);
    return date.getTime() /* / 1000 */;
}

export function subscribeOnStream(
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscriberUID,
    onResetCacheNeededCallback,
    lastDailyBar
) {
    const channelString = symbolInfo.ticker;
    const handler = {
        id: subscriberUID,
        callback: onRealtimeCallback,
    };
    let subscriptionItem = channelToSubscription.get(channelString);
    subscriptionItem = {
        subscriberUID,
        resolution,
        lastDailyBar,
        handlers: [handler],
    };
    channelToSubscription.set(channelString, subscriptionItem);
    console.debug("[subscribeBars]: Subscribe to streaming. Channel:", channelString);

    // Start streaming when the first subscription is made
    startStreaming();
}

export function unsubscribeFromStream(subscriberUID) {
    // Find a subscription with id === subscriberUID
    for (const channelString of channelToSubscription.keys()) {
        const subscriptionItem = channelToSubscription.get(channelString);
        const handlerIndex = subscriptionItem.handlers.findIndex((handler) => handler.id === subscriberUID);

        if (handlerIndex !== -1) {
            // Unsubscribe from the channel if it is the last handler
            console.debug("[unsubscribeBars]: Unsubscribe from streaming. Channel:", channelString);
            channelToSubscription.delete(channelString);
            break;
        }
    }
}
