export const bsc = async () => {
    try {
        const getNetworkInfo = await fetch(`https://bscgas.info/gas`).then(response => response.json());
        return BigInt(getNetworkInfo.standard);
    } catch (e) {
        return BigInt(7);
    }
}

