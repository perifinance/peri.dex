import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "reducers";
import pynthsCategories from "configure/coins/pynthsCategories";
import { updateCoin } from "reducers/coin/coinList";
import { formatCurrency } from "lib";
import "./CoinList.css";
// import { use } from "i18next";
// import { resetChartData } from "reducers/chart/chart";

interface ICoinList {
    isHide?: Boolean;
    isCoinList?: Boolean;
    coinListType: any;
    selectedCoin: Function;
    closeCoinList?: Function;
}

const CoinList = ({ isHide, isCoinList, coinListType, selectedCoin, closeCoinList }: ICoinList) => {
    const { coinList } = useSelector((state: RootState) => state.coinList);
    const selectedCoins = useSelector((state: RootState) => state.selectedCoin);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isFavoriteFilter, setIsFavoriteFilter] = useState(null);
    const [filterCoinList, setFilterCoinList] = useState([]);
    const [searchValue, setSearchValue] = useState("");

    const dispatch = useDispatch();

    const setFavorite = (coin) => {
        let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        if (coin.favorite) {
            favorites = favorites.filter((e) => e !== coin.id);
        } else {
            favorites.push(coin.id);
        }
        localStorage.setItem("favorites", JSON.stringify(favorites));
        dispatch(updateCoin({ ...coin, favorite: !coin.favorite }));
    };

    useEffect(() => {
        if (!coinList?.length) {
            return;
        }
        let filterResult = coinList?.slice();

        if (filterResult && selectedCategory === "Favorites") {
            filterResult = filterResult.filter((e) => e.favorite === true);
        } else if (filterResult && selectedCategory !== "All") {
            filterResult = filterResult.filter((e) => e.categories.includes(selectedCategory));
        }

        if (filterResult === undefined && !(searchValue === "" && searchValue === null)) {
            filterResult = filterResult.filter(
                (e) =>
                    e.symbol.toLocaleLowerCase().includes(searchValue.toLowerCase()) ||
                    e.name.toLocaleLowerCase().includes(searchValue.toLowerCase())
            );
            console.log("filterResult", filterResult);
        }

        if (isFavoriteFilter) {
            filterResult = filterResult?.sort((a, b) => (Number(b.favorite) - Number(a.favorite)));
            // console.log("sorted", filterResult);
        }

        setFilterCoinList(filterResult);
    }, [selectedCategory, isFavoriteFilter, searchValue, coinList]);

    useEffect(() => {
        if (coinList.length > 0) {
            setSelectedCategory(pynthsCategories[0]);
            // setFilterCoinList(coinList.slice());
        }
    }, [setSelectedCategory, coinList]);

    const coinListRef = useRef<any>();
    const handleCloseModal = useCallback(
        (e) => {
            if (e.target.id === "list-caller") return;
            if (isCoinList && !coinListRef.current?.contains(e.target)) {
                closeCoinList();
            }
        },
        [closeCoinList, isCoinList]
    );

    useEffect(() => {
        window.addEventListener("click", handleCloseModal);
        return () => {
            window.removeEventListener("click", handleCloseModal);
        };
    }, [handleCloseModal]);

    return (
        <div
            className={`w-fit mb-6 bg-blue-900 h-full rounded-l-lg overflow-hidden shadow-slate-400/50 shadow-sm z-10 absolute top-0 right-0 ${
                isCoinList ? "animate-r-fade-in " : "animate-r-fade-out"
            } ${isHide ? "hidden" : "flex"}`}
        >
            <div
                className="flex flex-col h-full w-8 hover:bg-blue-850 hover:animate-x-bounce text-blue-300 justify-between items-center hover:items-end py-20"
                id="list-caller"
                onClick={() => {
                    closeCoinList();
                }}
            >
                <img className="w-3 h-6 mr-[2px]" src="images/icon/double-arrow-right.svg" alt="double_arrow" />
                <img className="w-3 h-6 mr-[2px]" src="images/icon/double-arrow-right.svg" alt="double_arrow" />
                <img className="w-3 h-6 mr-[2px]" src="images/icon/double-arrow-right.svg" alt="double_arrow" />
            </div>
            <div className="w-full py-2 ss:py-2">
                <div className=" flex flex-col items-start mb-4 h-full" ref={coinListRef}>
                    {/* <div className="relative text-center mb-4 ml-4">
                        <div className="text-lg">Select a token</div>
                    </div> */}
                    {/* <div className="flex justify-end w-[90%] py-1">
                        <div className="flex py-4">
                            {pynthsCategories &&
                                pynthsCategories.length > 0 &&
                                pynthsCategories.map((category, index) => {
                                    return (
                                        <button
                                            key={index}
                                            className={`block mx-1 px-2 py-1 text-xs focus:outline-none font-normal border rounded-md border-blue-600 ${
                                                selectedCategory === category
                                                    ? "border-blue-500 text-blue-200 bg-blue-950 font-semibold"
                                                    : " font-semibold text-blue-600 bg-blue-900"
                                            }`}
                                            onClick={() => setSelectedCategory(category)}
                                        >
                                            {category}
                                        </button>
                                    );
                                })}
                        </div>
                        <img
                            className="w-3 h-3 my-auto cursor-pointer"
                            onClick={() => setIsFavoriteFilter(!isFavoriteFilter)}
                            src={`images/icon/bookmark_${isFavoriteFilter ? "on" : "off"}.svg`}
                            alt="bookmark"
                        ></img>
                    </div> */}
                    <div className="flex flex-nowrap justify-between w-[95%] pl-1 p-1 ss:py-4">
                        <div className="flex items-center bg-blue-950 rounded-md ss:px-2 w-[85%] overflow-y-auto">
                            <svg
                                className="fill-current text-gray-300 w-4 h-4"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    className="heroicon-ui"
                                    d="M16.32 14.9l5.39 5.4a1 1 0 0 1-1.42 1.4l-5.38-5.38a8 8 0 1 1 1.41-1.41zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"
                                />
                            </svg>
                            <input
                                className="rounded-md bg-blue-950 w-[116px] text-blue-200 leading-tight border-none focus:outline-none py-2 px-2 text-xs"
                                type="text"
                                placeholder="Symbol or Name"
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                        </div>
                        <img
                            className="w-4 h-4 my-auto cursor-pointer"
                            onClick={() => setIsFavoriteFilter(!isFavoriteFilter)}
                            src={`images/icon/bookmark_${isFavoriteFilter ? "on" : "off"}.svg`}
                            alt="bookmark"
                        ></img>
                    </div>
                    <div className="w-full py-1 text-xs mt-1 scrollbarOn max-h-640 lg:h-[94%] pr-3 flex flex-col justify-between gap-1">
                        {filterCoinList?.length > 0 &&
                            filterCoinList.map((coin, index) => {
                                return (
                                    coin && (
                                        <div
                                            key={index}
                                            className={`${index} flex justify-between cursor-pointer text-gray-300 hover:bg-blue-950 px-1 pb-2 ${
                                                selectedCoins[coinListType]?.id === coin?.id && "bg-blue-950"
                                            }`}
                                            onClick={() => {
                                                if (selectedCoins[coinListType]?.id !== coin?.id) {
                                                    // dispatch(resetChartData());
                                                    selectedCoin(coin);
                                                }
                                            }}
                                        >
                                            <div
                                                className="w-4 h-4 my-auto"
                                                onClick={(e) => {
                                                    setFavorite(coin);
                                                    e.stopPropagation();
                                                    e.nativeEvent.stopImmediatePropagation();
                                                }}
                                            >
                                                <img
                                                    className="w-4 h-4"
                                                    src={`images/icon/bookmark_${coin?.favorite ? "on" : "off"}.svg`}
                                                    alt="favorite"
                                                ></img>
                                            </div>
                                            <div className="w-4 h-4 my-auto">
                                                <img
                                                    className="w-4 h-4"
                                                    src={`images/currencies/${coin?.symbol}.svg`}
                                                    alt="network"
                                                />
                                            </div>
                                            <div className="w-14 text-xs px-1">{coin?.symbol}</div>
                                            <div className={`w-11 text-end text-[10px] font-medium ${
                                                coin?.change !== 0n ? coin?.change > 0n ? "text-blue-500" : "text-red-400" : "text-gray-300"
                                            }`}>{formatCurrency(coin?.price, 8)}</div>
                                            <div className={`w-11 text-end text-[10px] font-medium text-nowrap ${
                                                coin?.change !== 0n ? coin?.change > 0n ? "text-blue-500" : "text-red-400" : "text-gray-300"
                                            }`}>
                                                {coin?.change !== 0n ? coin?.change > 0n ? "▲" : "▼" : ""}
                                                {coin?.change < 0n ? Number(formatCurrency(coin?.change, 2)) * -1 : formatCurrency(coin?.change, 2)}%</div>
                                        </div>
                                    )
                                );
                            })}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CoinList;
