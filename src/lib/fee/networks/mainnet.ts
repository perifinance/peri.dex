export const mainnet = async () => {
    const API_KEY = process.env.REACT_APP_DEFIPULSE_API_KEY;
    try {
        const getNetworkInfo = await fetch(`https://ethgasstation.info/api/ethgasAPI.json?api-key=${API_KEY}`).then(response => response.json());
        return (BigInt(getNetworkInfo.average / 10));
    } catch (e) {
        return BigInt(10);
    }
}