import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'reducers';
import pynthsCategories from 'configure/coins/pynthsCategories'
import { updateCoin } from 'reducers/coin/coinList'

const CoinList = ({coinListType, selectedCoin}) => {
    const { coinList } = useSelector((state: RootState) => state.coinList);
    const selectedCoins = useSelector((state: RootState) => state.selectedCoin);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isFavoriteFilter, setIsFavoriteFilter] = useState(null);
    const [ filterCoinList, setFilterCoinList] = useState([]);
    const [ searchValue, setSearchValue] = useState('');

    const dispatch = useDispatch();

    const setFavorite = (coin) => {
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        if(coin.favorite) {
            favorites = favorites.filter((e) => e !== coin.id);
        } else {
            favorites.push(coin.id);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        dispatch(updateCoin({...coin, favorite: !coin.favorite}));
    }

    useEffect(() => {
        let filterResult = coinList.slice();
        if(selectedCategory === 'My List') {
            filterResult = filterResult.filter(e => e.favorite === true);
        } else if(selectedCategory !== 'All') {
            filterResult = filterResult.filter(e => e.categories.includes(selectedCategory))
        }

        if( !(searchValue === '' && searchValue === null)) {
            filterResult = filterResult.filter(e => e.symbol.toLocaleLowerCase().includes(searchValue.toLowerCase()) || e.name.toLocaleLowerCase().includes(searchValue.toLowerCase()))
        }

        if(isFavoriteFilter) {
            filterResult = filterResult.sort((a, b) => Number(b.favorite) - Number(a.favorite));
        }

        setFilterCoinList(filterResult);
        
    },[selectedCategory, isFavoriteFilter, searchValue, coinList])

    useEffect(() => {
        if(coinList.length > 0) {
            setSelectedCategory(pynthsCategories[0]);
            setFilterCoinList(coinList.slice());
        }
    }, [setSelectedCategory, setFilterCoinList, coinList])

    return (
        
            <div className="flex mb-6 bg-gray-700 rounded-lg p-4 min-h-full overflow-y-scroll min-w-80">
                <div className="w-full">
                    <div className="mb-4">
                        <div className="relative text-center mb-4 ml-4">
                            <button type="button" className="absolute top-0 bottom-0 block" onClick={() => selectedCoin()}>
                                <img src="images/icon/left_arrow.svg" alt="left_arrow"></img>
                            </button>
                            <div className="text-lg">
                                Select a token
                            </div>
                        </div>
                        
                        <div className="flex items-center bg-gray-500 rounded-md py-2 px-5">
                            <svg className="fill-current text-gray-300 w-6 h-6" xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24">
                                <path className="heroicon-ui"
                                    d="M16.32 14.9l5.39 5.4a1 1 0 0 1-1.42 1.4l-5.38-5.38a8 8 0 1 1 1.41-1.41zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
                            </svg>
                            <input
                                className="w-full rounded-md bg-gray-500 text-gray-300 leading-tight focus:outline-none py-2 px-2"
                                type="text" placeholder="Enter the token symbol or name" onChange={(e)=> setSearchValue(e.target.value)}/>
                        </div>

                        <div className="flex justify-between">
                            <div className="flex overflow-hidden py-4">
                                {pynthsCategories && pynthsCategories.length > 0 && pynthsCategories.map((category, index) => {
                                    return (
                                        <button key={index} className={`block mx-1 px-2 focus:outline-none font-bold border rounded-md border-gray-300 ${selectedCategory === category && 'border-blue-500 text-blue-500 bg-gray-700'}`}
                                                onClick={() => setSelectedCategory(category)}
                                        >
                                            {category}
                                        </button>    
                                    )
                                })}                                    
                            </div>
                            <img className="w-4 h-4 my-auto cursor-pointer" onClick={() => setIsFavoriteFilter(!isFavoriteFilter)} src={`images/icon/bookmark_${isFavoriteFilter ? 'on': 'off'}.svg`} alt="bookmark"></img>
                        </div>

                        <div className="py-3 text-sm">
                            {filterCoinList && filterCoinList.length > 0 && filterCoinList.map((coin, index) => {
                                return (
                                    <div key={index} className={`flex justify-start cursor-pointer text-gray-200 hover:bg-black-900 rounded-md px-2 py-2 my-2 ${selectedCoins[coinListType].id === coin.id && 'bg-black-900'}`} onClick={ () => selectedCoins[coinListType].id !== coin.id && selectedCoin(coin)}>
                                        <div onClick={ (e) => {setFavorite(coin); e.stopPropagation();}}>
                                            <img className="w-6 h-6" src={`images/icon/bookmark_${coin.favorite ? 'on': 'off'}.svg`} alt="favorite"></img>
                                        </div>
                                        <img className="w-6 h-6 mx-2" src={`images/currencies/${coin.symbol}.svg`} alt="network"/>
                                        <div className="flex-grow font-medium px-2">{coin.symbol}</div>
                                        <div className="text-sm font-normal text-gray-300 tracking-wide">{coin.name}</div>
                                    </div>
                                )

                            })}
                        </div>
                    </div>
                </div>
            </div>
        
    )
}
export default CoinList;