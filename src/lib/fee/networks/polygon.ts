export const polygon = async () => {
    try {
        const getNetworkInfo = await fetch(`https://gasstation-mainnet.matic.network`).then(response => response.json());
        return BigInt(getNetworkInfo.standard);
    } catch (e) {
        return BigInt(25);
    }
}

