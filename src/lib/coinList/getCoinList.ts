import pynths from 'configure/coins/pynths';
import { pynthsList } from 'configure/coins/pynthsList';
import _ from 'lodash';

export const getCoinList = (networkId, exCoinList:any): Array<any> => {
    if (!pynths[networkId]) return null;
    let coinList = [...pynths[networkId]];
    let allList = exCoinList.length ? exCoinList : pynthsList;

    const favorite = JSON.parse(localStorage.getItem('favorites') || '[]');

    return allList.map(e => {
        const isActive = coinList.find(coin => coin.symbol === e.symbol) !== undefined;
        const idx = favorite.findIndex((id) => id === e.id);
        return {...e, isActive , favorite: idx !== -1 };
    });
}

export const getSafeSymbol = (symbol: string, isSource:boolean = true) => {
    return symbol ? symbol : isSource ? "pUSD" : "pBTC";
}