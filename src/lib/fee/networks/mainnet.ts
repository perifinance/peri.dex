export const mainnet = async () => {
    const API_KEY = process.env.REACT_APP_ETHERSCAN_KEY;
    try {
        const getNetworkInfo = await fetch(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${API_KEY}`).then(response => response.json());
        const { ProposeGasPrice } = getNetworkInfo.result;
        return (BigInt(ProposeGasPrice / 10));
    } catch (e) {
        return BigInt(10);
    }
    
}