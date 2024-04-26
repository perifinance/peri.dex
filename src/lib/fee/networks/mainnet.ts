export const mainnet = async (networkId) => {
    const API_KEY = process.env.REACT_APP_ETHERSCAN_KEY;
    try {
        const getNetworkInfo = await fetch(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${API_KEY}`).then(response => response.json());
        const { ProposeGasPrice } = getNetworkInfo.result;
        return ProposeGasPrice;
    } catch (e) {
        return '10';
    }
    
}