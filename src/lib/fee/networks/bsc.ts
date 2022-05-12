export const bsc = async () => {
    try {
        const getNetworkInfo = await fetch("https://api.bscscan.com/api?module=gastracker&action=gasoracle&apikey="+process.env.REACT_APP_BSCSCAN_API_KEY).then(response => response.json());
        return BigInt(getNetworkInfo.standard);
    } catch (e) {
        return BigInt(7);
    }
}

