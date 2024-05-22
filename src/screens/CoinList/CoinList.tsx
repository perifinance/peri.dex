import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "reducers";
import pynthsCategories from "configure/coins/pynthsCategories";
import { updateFavorite } from "reducers/coin/coinList";
import { formatCurrency } from "lib";
import "css/CoinList.css";
// import { use } from "i18next";
// import { resetChartData } from "reducers/chart/chart";

interface ICoinList {
    isHide?: boolean;
    isCoinList?: boolean;
    coinListType: any;
    setSelectedCoin: Function;
    closeCoinList?: Function;
    isSideBar?: boolean;
    isBuy?: boolean;
}

const CoinList = ({ isHide, isCoinList, coinListType, setSelectedCoin, closeCoinList, isBuy, isSideBar = true }: ICoinList) => {
    const { coinList } = useSelector((state: RootState) => state.coinList);
    const selectedCoins = useSelector((state: RootState) => state.selectedCoin);
    const [selectedCategory, setSelectedCategory] = useState("all");
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
        dispatch(updateFavorite({ ...coin, favorite: !coin.favorite }));
    };

    useEffect(() => {
        if (!coinList?.length) {
            return;
        }

        let filterResult = coinList?.slice();

        if (filterResult && selectedCategory === "Favorites") {
            filterResult = filterResult.filter((e) => e.favorite === true);
        } else if (filterResult && selectedCategory !== "all") {
            filterResult = filterResult.filter((e) => e.categories.includes(selectedCategory));
        }

        if (filterResult !== undefined && !(searchValue === "" && searchValue === null)) {
            filterResult = filterResult.filter(
                (e) =>
                    e.symbol.toLocaleLowerCase().includes(searchValue.toLowerCase()) ||
                    e.name.toLocaleLowerCase().includes(searchValue.toLowerCase())
            );
            // console.log("filterResult", filterResult);
        }

        if (isFavoriteFilter) {
            filterResult = filterResult?.sort((a, b) => Number(b.favorite) - Number(a.favorite));
            // console.log("sorted", filterResult);
        }

        setFilterCoinList(filterResult);
    }, [selectedCategory, isFavoriteFilter, searchValue, coinList]);


    // useEffect(() => {
    //     if (coinList.length > 0) {
    //         setSelectedCategory(pynthsCategories[0]);
    //         // setFilterCoinList(coinList.slice());
    //     }
    // }, [setSelectedCategory, coinList]);

    const coinListRef = useRef<any>();
    const handleCloseModal = useCallback(
        (e) => {
            if (["list-caller", "symbol_search"].includes(e.target.id)) return;
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
            className={`w-fit mb-6 h-full overflow-hidden shadow-slate-400/50 shadow-sm z-10 ${
                isSideBar ? "absolute top-0 right-0 rounded-l-lg " : "mr-1 rounded-lg"
            } ${isCoinList ? "animate-r-fade-in " : "animate-r-fade-out"} ${
                isHide ? "hidden" : "flex"
            } ${
                isBuy ? "from-cyan-950 to-cyan-950" : "from-red-950 to-red-950"
            } bg-gradient-to-tl via-blue-950`}
        >
            <div
                className={`h-full w-8 hover:animate-x-bounce text-blue-300 ${
                    isSideBar ? "flex flex-col" : "hidden"
                } justify-between items-center hover:items-end py-20`}
                id="list-caller"
                onClick={() => {
                    closeCoinList();
                }}
            >
                <img className="w-3 h-6 mr-[2px]" src="images/icon/double-arrow-right.svg" alt="double_arrow" />
                <img className="w-3 h-6 mr-[2px]" src="images/icon/double-arrow-right.svg" alt="double_arrow" />
                <img className="w-3 h-6 mr-[2px]" src="images/icon/double-arrow-right.svg" alt="double_arrow" />
            </div>
            <div className={`w-full py-2 ${isSideBar ? "" : " pl-2"}`}>
                <div className=" flex flex-col items-start mb-4 h-full" ref={coinListRef}>
                    {/* <div className="relative text-center mb-4 ml-4">
                        <div className="text-lg">Select a token</div>
                    </div> */}
                    {/* <div className={`flex w-full justify-center `}> */}
                    {/* {!isSideBar &&  */}
                    <div className=" flex-row w-full justify-between min-w-[200px] pt-1 pr-2 flex" id="list-caller">
                        {pynthsCategories &&
                            pynthsCategories.length > 0 &&
                            pynthsCategories.map((category, index) => {
                                const lCatagory = category.toLowerCase();
                                return (
                                    <div
                                        className="flex flex-col mx-1 items-center cursor-pointer w-[22%]"
                                        key={index}
                                        id="list-caller"
                                        onClick={() => setSelectedCategory(lCatagory)}
                                    >
                                        <img
                                            id="list-caller"
                                            alt="category"
                                            className={`w-3 h-3 ss:w-[17px] ss:h-[17px]`}
                                            src={`images/icon/${lCatagory}${
                                                selectedCategory === lCatagory ? "_on" : "_off"
                                            }.svg`}
                                        />
                                        <span
                                            className={`text-[6px] ss:text-[7px] text-blue-200 tracking-tighter ${
                                                selectedCategory === lCatagory
                                                    ? "border-blue-500 text-blue-200 font-semibold"
                                                    : "font-semibold text-blue-600 "
                                            }`}
                                            id="list-caller"
                                        >{`${category}`}</span>
                                    </div>
                                );
                            })}
                        <div
                            className="flex flex-col mx-1 items-center cursor-pointer w-[22%]"
                            key={5}
                            id="list-caller"
                            onClick={() => setIsFavoriteFilter(!isFavoriteFilter)}
                        >
                            <img
                                id="list-caller"
                                className="w-3 h-3 ss:w-[17px] ss:h-[17px] my-auto cursor-pointer"
                                src={`images/icon/bookmark_${isFavoriteFilter ? "on" : "off"}.svg`}
                                alt="bookmark"
                            ></img>
                            <span
                                className={`text-[6px] ss:text-[7px] text-blue-200 tracking-tighter ${
                                    isFavoriteFilter
                                        ? "border-blue-500 text-blue-200 font-semibold"
                                        : "font-semibold text-blue-600 "
                                }`}
                                id="list-caller"
                            >{`Favorite`}</span>
                        </div>
                    </div>

                    {/* <img
                            className="w-5 h-5 my-auto cursor-pointer mx-2"
                            onClick={() => setIsFavoriteFilter(!isFavoriteFilter)}
                            src={`images/icon/bookmark_${isFavoriteFilter ? "on" : "off"}.svg`}
                            alt="bookmark"
                        ></img> 
                            </div> */}
                    <div className="flex flex-nowrap justify-between w-[94%] py-[2px] pb-1 ss:pb-[6px]">
                        <div className="flex items-center bg-blue-950 rounded-[4px] pl-2 w-full overflow-y-auto">
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
                                id="symbol_search"
                                className="rounded-md bg-blue-950 w-[88%] text-blue-200 leading-tight border-none focus:outline-none py-2 px-2 text-xs text-center"
                                type="text"
                                placeholder="Symbol or Name"
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                        </div>
                        {/* <img
                            id="list-caller"
                            className="w-4 h-4 my-auto cursor-pointer"
                            onClick={() => setIsFavoriteFilter(!isFavoriteFilter)}
                            src={`images/icon/bookmark_${isFavoriteFilter ? "on" : "off"}.svg`}
                            alt="bookmark"
                        ></img> */}
                    </div>
                    <div className={`w-full text-xs scrollbarOn max-h-640 lg:h-[94%] pr-3 flex flex-col gap-1`}>
                        {filterCoinList?.length > 0 &&
                            filterCoinList.map((coin, index) => {
                                if (coin.symbol === "pUSD") return null;
                                return (
                                    coin && (
                                        <div
                                            key={index}
                                            className={`flex flex-row justify-between px-1 py-1 items-center ${
                                                selectedCoins[coinListType]?.id === coin?.id
                                                    ? " border-[1px] border-cyan-850/25 bg-skyblue-950 text-gray-300"
                                                    : coin.isActive
                                                    ? "hover:bg-blue-950 cursor-pointer text-gray-300"
                                                    : " text-gray-600"
                                            } rounded-[4px]`}
                                            onClick={() => {
                                                if (coin.isActive && selectedCoins[coinListType]?.id !== coin?.id) {
                                                    // dispatch(resetChartData());
                                                    setSelectedCoin(coin.symbol);
                                                }
                                            }}
                                        >
                                            
                                            {/* <div className="w-[15px] h-[15px] my-auto">
                                                <img
                                                    className={`w-[15px] h-[15px] ${
                                                        coin?.isActive ? "opacity-100" : "opacity-50"
                                                    }`}
                                                    src={`images/currencies/${coin?.symbol}.svg`}
                                                    alt={`ccy-${coin?.symbol}`}
                                                />
                                            </div> */}
                                            <div className="w-14 text-xs px-1">{coin?.symbol}</div>
                                            <div
                                                className={`w-11 text-end text-[10px] font-medium ${
                                                    coin?.isActive
                                                        ? coin?.upDown
                                                            ? coin?.upDown > 0
                                                                ? "text-blue-500"
                                                                : "text-red-400"
                                                            : "text-gray-300"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                {formatCurrency(coin?.price, 8)}
                                            </div>
                                            <div
                                                className={`w-11 text-end text-[10px] font-medium text-nowrap ${
                                                    coin?.isActive
                                                        ? coin?.change !== 0n
                                                            ? coin?.change > 0n
                                                                ? "text-blue-500"
                                                                : "text-red-400"
                                                            : "text-gray-300"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                {coin?.change !== 0n ? (coin?.change > 0n ? "▲" : "▼") : ""}
                                                {coin?.change < 0n
                                                    ? formatCurrency(coin?.change, 2).substring(1)
                                                    : formatCurrency(coin?.change, 2)}
                                                %
                                            </div>
                                            <div
                                                className="w-[10px] h-[10px] flex justify-center items-center"
                                                onClick={(e) => {
                                                    if (!coin.isActive) return;
                                                    setFavorite(coin);
                                                    e.stopPropagation();
                                                    e.nativeEvent.stopImmediatePropagation();
                                                }}
                                            >
                                                <img
                                                    className={`w-[10px] h-[10px] ${
                                                        coin.isActive ? "opacity-100" : "opacity-30"
                                                    }`}
                                                    src={`images/icon/bookmark_${coin?.favorite ? "on" : "off"}.svg`}
                                                    alt="favorite"
                                                ></img>
                                            </div>
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
