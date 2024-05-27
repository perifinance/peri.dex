import pynths from 'configure/coins/pynths';
import { pynthsList } from 'configure/coins/pynthsList';
import _ from 'lodash';

export const getCoinList = (networkId): Array<any> => {
    if (!pynths[networkId]) return null;
    let coinList = [...pynths[networkId]];

    const favorite = JSON.parse(localStorage.getItem('favorites') || '[]');

    return pynthsList.map(e => {
        const isActive = coinList.find(coin => coin.symbol === e.symbol) !== undefined;
        const idx = favorite.findIndex((id) => id === e.id);
        return {...e, price:0, high:0, low:0, preClose:0, upDown:0, change:0, isActive , favorite: idx !== -1 };
    });
}

export const getSafeSymbol = (symbol: string, isSource:boolean = true) => {
    return symbol ? symbol : isSource ? "pUSD" : "pBTC";
}