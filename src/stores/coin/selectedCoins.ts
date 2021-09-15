import { key } from './isCoinList'
import pynths from "../../configure/coins/pynths";
import { writable, get } from 'svelte/store';

export const selectedCoins = writable({
    source: pynths[0],
    destination: pynths[1]
})

export const selectCoin = (value) => {
    let updateSelectedCoins = get(selectedCoins);
    updateSelectedCoins[get(key)] = value;
    selectedCoins.set(updateSelectedCoins)
}
