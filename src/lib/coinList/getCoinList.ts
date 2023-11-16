import pynths from 'configure/coins/pynths';

export const getCoinList = (networkId) => {
    let coinList = pynths[networkId];
    const favorite = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    favorite.forEach(e => {
        coinList[e].favorite = true;
    });
    return coinList;
}

export const getSafeSymbol = (symbol: string, isSource:boolean = true) => {
    return symbol ? symbol : isSource ? "pUSD" : "pBTC";
}