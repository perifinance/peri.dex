import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector/* , useDispatch, shallowEqual */ } from "react-redux";
import { RootState } from "reducers";
import pynthsCategories from "configure/coins/pynthsCategories";
// import { updateFavorite } from "reducers/coin/coinList";
// import { formatNumber } from "lib";
// import { ColoredPrice } from "components/ColoredPrice";
import "css/CoinList.css";
// import useSelectedCoin from "hooks/useSelectedCoin";
import CoinLine from "./CoinLine";
// import { use } from "i18next";
// import { resetChartData } from "reducers/chart/chart";

interface ICoinList {
    isHide?: boolean;
    isCoinList?: boolean;
    // coinListType: any;
    // setSelectedCoin: Function;
    closeCoinList?: Function;
    isSideBar?: boolean;
    isBuy?: boolean;
}

const CoinList = ({ isHide, isCoinList, /* coinListType, setSelectedCoin, */ closeCoinList, isBuy, isSideBar = true }: ICoinList) => {
    const { coinList } = useSelector((state: RootState) => state.coinList);
    // const selectedCoins = useSelector((state: RootState) => state.selectedCoin);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [isFavoriteFilter, setIsFavoriteFilter] = useState(null);
    // const [filterCoinList, setFilterCoinList] = useState([]);
    const [filterMap, setFilterMap] = useState({});
    const [searchValue, setSearchValue] = useState("");
    // const [{ selectedType }, setSelectedCoin] = useSelectedCoin();

    useEffect(() => {
        if (!coinList?.length) {
            return;
        }

        let filterResult = coinList.slice();
        // console.log("filterResult", filterResult);

        if (filterResult && selectedCategory === "Favorites") {
            filterResult = filterResult.filter((e) => e.favorite === true);
        } else if (filterResult && selectedCategory !== "all") {
            filterResult = filterResult.filter((e) => e.categories.includes(selectedCategory));
        }

        // console.log("filterResult", filterResult);
        if (filterResult !== undefined && !(searchValue === "" && searchValue === null)) {
            filterResult = filterResult.filter(
                (e) =>
                    e.symbol.toLowerCase().includes(searchValue.toLowerCase()) ||
                    e.name.toLowerCase().includes(searchValue.toLowerCase())
            );
            // console.log("filterResult", filterResult);
        }

        if (isFavoriteFilter) {
            filterResult = filterResult?.sort((a, b) => Number(b.favorite) - Number(a.favorite));
            // console.log("sorted", filterResult);
        }


        const mapFilteredIdcs = {};
        filterResult.forEach((e,idx) => {
            mapFilteredIdcs[e.symbol] = e.id;
        });

        setFilterMap(mapFilteredIdcs);
        // setFilterCoinList(filterResult);
    }, [selectedCategory, isFavoriteFilter, searchValue, coinList.length]);


    // useEffect(() => {
    //     console.log("setSelectedCategory");
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
                        {Object.keys(filterMap).map((key:string,index:number) => key !== 'pUSD' && <CoinLine key={index} index={filterMap[key]} />)}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CoinList;
