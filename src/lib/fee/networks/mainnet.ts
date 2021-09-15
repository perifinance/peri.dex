export const mainnet = async () => {
    const API_KEY = import.meta.env.VITE_DEFIPULSE_API_KEY;
    try {
        const getNetworkInfo = await fetch(`https://ethgasstation.info/api/ethgasAPI.json?api-key=${API_KEY}`).then(response => response.json());
        return (BigInt(getNetworkInfo.average / 10));
    } catch (e) {
        return BigInt(10);
    }
}