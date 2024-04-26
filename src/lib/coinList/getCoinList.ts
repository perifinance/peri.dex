import pynths from 'configure/coins/pynths';

export const getCoinList = (networkId) => {
    if (!pynths[networkId]) return null;
    let coinList = [...pynths[networkId]];

    const favorite = JSON.parse(localStorage.getItem('favorites') || '[]');

    favorite.forEach(e => {
        if (coinList[e]) coinList[e].favorite = true;
    });

    // console.log(coinList);
    return coinList;
}

export const getSafeSymbol = (symbol: string, isSource:boolean = true) => {
    return symbol ? symbol : isSource ? "pUSD" : "pBTC";
}