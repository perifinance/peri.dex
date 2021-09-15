import pynths from "../../configure/coins/pynths";
import { writable } from 'svelte/store';

export const coinList = writable(pynths);

export const setCoinList = () => {
    let favorite = JSON.parse(localStorage.getItem('favorite') || '[]');
    
    favorite.forEach(e => {
        pynths[e].favorite = true;
    });
    coinList.set(pynths);
}

export const setFavorite = (index) => {
    let favorite = JSON.parse(localStorage.getItem('favorite') || '[]');

    pynths[index].favorite = !pynths[index].favorite;
    
    if(pynths[index].favorite) {
        favorite.push(index);
    } else {
        favorite = favorite.filter((e) => e !== index);
    }
    
    localStorage.setItem('favorite', JSON.stringify(favorite))
    coinList.set(pynths);
}