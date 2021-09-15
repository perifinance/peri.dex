import { writable } from 'svelte/store';

export const isCoinList = writable(false);
export const key = writable(null);

export const openCoinList = (currencyKey) => {
    isCoinList.set(true);
    key.set(currencyKey);
}

export const closeCoinList= () => {
    isCoinList.set(false);
    key.set(null);
}