export const bsc = async (networkId) => {
    try {
        const getNetworkInfo = await fetch(
            "https://api.bscscan.com/api?module=gastracker&action=gasoracle&apikey=" +
                process.env.REACT_APP_BSCSCAN_API_KEY
        ).then((response) => response.json());
        if (typeof getNetworkInfo.result == "string" || getNetworkInfo.result == null) {
            return "1";
        }
        return getNetworkInfo.result.ProposeGasPrice;
    } catch (e) {
        console.log("error", e);
        return "7";
    }
};
