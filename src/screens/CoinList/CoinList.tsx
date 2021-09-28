import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'reducers';
import pynthsCategories from 'configure/coins/pynthsCategories'

const CoinList = ({selectedCoin}) => {
    const {coinList} = useSelector((state: RootState) => state.coinList);
    return (
        <div className="w-full">
            <div className="flex">
                <div className="w-full max-w-md">
                    <div className="mb-4">
                        <div className="flex flex-row-reverse">
                            <button type="button" className="rounded-md py-1 inline-flex items-center justify-center text-gray-400 hover:text-gray-500" onClick={() => selectedCoin()}>                                
                                <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex items-center bg-gray-200 rounded-md">
                            <div className="pl-2">
                                <svg className="fill-current text-gray-500 w-6 h-6" xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24">
                                    <path className="heroicon-ui"
                                        d="M16.32 14.9l5.39 5.4a1 1 0 0 1-1.42 1.4l-5.38-5.38a8 8 0 1 1 1.41-1.41zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
                                </svg>
                            </div>
                            <input
                                className="w-full rounded-md bg-gray-200 text-gray-700 leading-tight focus:outline-none py-2 px-2"
                                type="text" placeholder="Enter the token symbol or name"/>
                        </div>
                        <nav className="flex flex-row-reverse">
                            <button className="w-1/6 text-gray-600 px-3 block hover:text-blue-500 focus:outline-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div className="flex overflow-hidden">
                                {pynthsCategories && pynthsCategories.length > 0 && pynthsCategories.map((category) => {
                                    return (
                                        <button className="text-gray-600 py-4 px-2 block hover:text-blue-500 focus:outline-none border-b-2 font-medium border-blue-500">
                                            {category}
                                        </button>    
                                    )
                                })}                                    
                            </div>
                            
                        </nav>
                        <div className="py-3 text-sm">
                            {coinList && coinList.length > 0 && coinList.map((coin, index) => {
                                return (
                                    <div className="flex justify-start cursor-pointer text-gray-200 hover:bg-gray-800 rounded-md px-2 py-2 my-2" onClick={ () => {selectedCoin(coin)}}>
                                        <div onClick={ (e) => {e.stopPropagation();}}>
                                            <svg className="w-6 h-6 fill-current {coin.favorite ? 'text-yellow-500' : 'text-gray-500'}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                            </svg>
                                        </div>
                                        <img className="w-6 h-6 mx-2" src="/logo/logo.png" alt="network"/>
                                        <div className="flex-grow font-medium px-2">{coin.symbol}</div>
                                        <div className="text-sm font-normal text-gray-500 tracking-wide">{coin.name}</div>
                                    </div>
                                )

                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default CoinList;