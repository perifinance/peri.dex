import React, { useEffect, useState } from "react";
import { formatCurrency } from "lib";
import { useSelector } from "react-redux";
import { RootState } from "reducers";
import { networkInfo } from "configure/networkInfo";

type TradesProps = {
    children?: React.ReactNode;
    histories: any;
};
const Trades = ({ children, histories }: TradesProps) => {
    const { networkId } = useSelector((state: RootState) => state.wallet);
    const [slot, setSlotNum] = useState(1);
    const [pages, setPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [keyward, setKeyward] = useState("");
    const [filteredHistory, setFilteredHistory] = useState([]);

    const [sortList, setSortList] = useState({
        chainId: 0,
        date: 0,
        src: 0,
        dest: 0,
    });

	const sortFunc = ( col, desc) => {
		switch (col) {
			case "chainId":
				return (a, b) => (a.chainId - b.chainId) * desc;
			case "src":
				return (a, b) => a.src.localeCompare(b.src) * desc;
			case "amount":
				return (a, b) => Number(BigInt(a.amount - b.amount) / (10n ** 9n)) * desc;
			case "amountReceived":
				return (a, b) =>  Number(BigInt(a.amountReceived - b.amountReceived) / (10n ** 9n)) * desc;
			case "dest":
				return (a, b) => a.dest.localeCompare(b.dest) * desc;
			case "date":
			default:
				return (a, b) => (new Date(a.date.replace(/-/g, " ")).getTime() - new Date(b.date.replace(/-/g, " ")).getTime()) * desc;
		}
	}

	const sortHistory = (col) => {

		const newSortList = {
			...sortList,
			[col]: sortList[col] ? sortList[col] > 0 ? sortList[col] * -1 : 0 : 1,
		}
		setSortList(newSortList);

		let sortedHistory = (col === "src") 
			? newSortList[col]
			? newSortList[col] > 0 
			? filteredHistory.map((e) => e).sort(sortFunc("amount", 1))
			: filteredHistory.map((e) => e).sort(sortFunc("amount", -1))
			: filteredHistory
			: filteredHistory
		;

		sortedHistory = (col === "desc") 
			? newSortList[col]
			? newSortList[col] > 0 
			? sortedHistory.map((e) => e).sort(sortFunc("amountReceived", 1))
			: sortedHistory.map((e) => e).sort(sortFunc("amountReceived", -1))
			: sortedHistory
			: sortedHistory
		;

		sortedHistory = newSortList[col]
			? newSortList[col] > 0 
			? sortedHistory.map((e) => e).sort(sortFunc(col, 1))
			: sortedHistory.map((e) => e).sort(sortFunc(col, -1))
			: sortedHistory.map((e) => e).sort(sortFunc("date", -1));

		

		setFilteredHistory(sortedHistory);

	}

    const getColSort = (col) => {
        return sortList[col] ? sortList[col] < 0 ? <span>&#9661;</span> : <span>&#9651;</span> : <span>&#9642;</span>;
    };

    const filterHistory = (keyward) => {
        if (keyward === "") {
            setFilteredHistory(histories);
            return;
        }

        const dateFiltered = findByTemplate(histories, { date: keyward });
        const srcFiltered = findByTemplate(histories, { src: keyward });
        const destFiltered = findByTemplate(histories, { dest: keyward });
        const chainIdFiltered = findByTemplate(histories, { chainId: keyward });
        const filtered = [...dateFiltered, ...srcFiltered, ...destFiltered, ...chainIdFiltered];

        setFilteredHistory(filtered);
    };
    const findByTemplate = (objects: Array<any>, template: any) => {
        return objects.filter((obj) => {
            return Object.keys(template).every((propertyName) =>
                obj[propertyName].toString().includes(template[propertyName])
            );
        });
    };

    const getPages = (size: number, slot: number) => {
        if (size === 0) {
            return [];
        }
        let pageCount = Math.ceil(size / 10);
        console.log("size", size, "pageCount", pageCount);

        console.log("slot", slot);

        pageCount = pageCount % 10;
        let pages = [];
        for (let a = 0; a < pageCount; a++) {
            pages.push(a);
        }
        console.log("pages", pages);
        return pages;
    };

    const MoveSlot = (forward: boolean) => {
        if (forward && slot * 10 < Math.ceil(filteredHistory.length / 10)) {
            setSlotNum(slot + 1);
            setPages(getPages(filteredHistory.length, slot + 1));
        } else if (!forward && slot > 1) {
            setSlotNum(slot - 1);
            setPages(getPages(filteredHistory.length, slot - 1));
        }
    };

    useEffect(() => {
        console.log("filteredHistory", filteredHistory);
        setPages(getPages(filteredHistory.length, slot));
    }, [filteredHistory]);

    useEffect(() => {
        filterHistory("");
    }, [histories]);

    return (
        <div className="flex flex-col mt-0 w-[98%] lg:w-3/4 h-full">
            <div className="flex justify-between items-center w-full xs:w-[98%] h-10">
                <div className="text-base sm:text-base lg:pl-2 font-semibold w-[35%]">Trade Order</div>
                <div className="flex items-center w-[65%]">
                    <label htmlFor="simple-search" className="sr-only">
                        Search
                    </label>
                    <div className="relative w-full ">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg
                                className="w-4 h-4 text-gray-400"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 18 20"
                            >
                                <path
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2"
                                />
                            </svg>
                        </div>
                        <input
                            type="text"
                            id="simple-search"
                            onChange={(e) => setKeyward(e.target.value)}
                            className="border text-[11px] md:text-sm rounded-l-lg block w-full ps-10 p-1.5 focus:outline-none focus:border-gray-600 bg-gray-700 border-gray-500 placeholder-gray-400 "
                            placeholder="Search Date, Chain, Pynth"
                        />
                    </div>
                    <button
                        type="submit"
                        className="p-[6.5px] md:p-[8.5px] text-sm font-medium rounded-r-lg border border-blue-600 bg-blue-600 hover:bg-blue-700"
                        onClick={() => filterHistory(keyward)}
                    >
                        <svg
                            className="w-4 h-4"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 20"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                            />
                        </svg>
                        <span className="sr-only">Search</span>
                    </button>
                </div>
            </div>
            {children}
            <div className="flex flex-col justify-between relative w-full xs:w-[98%] h-fit max-h-full overflow-x-scroll scrollbar-hide">
                <table className="table-auto mt-2 mb-2 w-fit xs:w-full h-[90%] min-w-136 border-gray-500">
                    <thead className="border-b border-gray-500 h-8">
                        <tr className="font-medium text-[11px] lg:text-sm text-gray-300">
                            <th className="cursor-pointer select-none" onClick={() => sortHistory("chainId")}>Chain{getColSort("chainId")}</th>
                            <th className="cursor-pointer select-none" onClick={() => sortHistory("date")}>Date{getColSort("date")}</th>
                            <th >Time</th>
                            <th className="cursor-pointer select-none" onClick={() => sortHistory("dest")}>Received{getColSort("dest")}</th>
                            <th >Price</th>
							<th className="cursor-pointer select-none" onClick={() => sortHistory("src")}>Paid{getColSort("src")}</th>
                            <th >Fee</th>
                            {/* <th onClick={sortList()}>Action</th> */}
                            <th >Details</th>
                        </tr>
                    </thead>
                    {filteredHistory.length > 0 && (
                        <tbody className="h-fit">
                            {filteredHistory.slice((currentPage - 1) * 10, currentPage * 10).map((e) => (
                                <tr className="h-[45px] text-[10px] sm:text-xs lg:text-sm" key={e.id}>
                                    <td className="flex justify-center items-center min-w-8 min-h-10">
                                        <img
                                            className="w-5 h-5 pr-1"
                                            src={`/images/network/${e.chainId}.svg`}
                                            alt="chainImg"
                                        ></img>
                                    </td>
                                    <td className="text-center">
                                        <span>{e.date.split("-")[0]}</span>
                                    </td>
                                    <td className="text-center">
                                        <span>{e.date.split("-")[1]}</span>
                                    </td>
                                    <td className="text-center">
                                        <div className="flex flex-nowrap justify-end ">
                                            {/* <div className="flex "> */}
                                            <img
                                                className="w-5 h-5 pl-1"
                                                src={`/images/currencies/${e.dest}.svg`}
                                                alt="currencies"
                                            ></img>
                                            {/* </div> */}
                                            <div className="ml-1">
                                                {formatCurrency(e.amountReceived, 8)}
                                                {/* <span className="pl-1 font-medium"> {e.dest}</span> */}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="flex flex-nowrap justify-end ">
                                            {/* <div className="flex "> */}
                                            <img
                                                className="w-5 h-5 pl-1"
                                                src={`/images/currencies/${e.src}.svg`}
                                                alt="currencies"
                                            ></img>
                                            {/* </div> */}
                                            <div className="ml-1">
                                                {formatCurrency(
                                                    ((e.amount - BigInt(e.exchangeFeeRate * e.amount) / 10n ** 18n) *
                                                        10n ** 18n) /
                                                        e.amountReceived,
                                                    5
                                                )}
                                                {/* <span className="pl-1 font-medium"> {e.src}</span> */}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="justify-end">
                                        <div className="flex flex-nowrap justify-end ">
                                            {/* <div className="flex "> */}
                                            <img
                                                className="w-5 h-5 pl-1"
                                                src={`/images/currencies/${e.src}.svg`}
                                                alt="currencies"
                                            ></img>
                                            {/* </div> */}
                                            <div className="ml-1">
                                                {formatCurrency(e.amount, 8)}
                                                {/* <span className="pl-1 font-medium"> {e.src}</span> */}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="flex flex-nowrap justify-end ">
                                            {/* <div className="flex "> */}
                                            <img
                                                className="w-5 h-5 pl-1"
                                                src={`/images/currencies/${e.src}.svg`}
                                                alt="currencies"
                                            ></img>
                                            {/* </div> */}
                                            <div className="ml-1">
                                                {formatCurrency(BigInt(e.exchangeFeeRate * e.amount) / 10n ** 18n, 8)}
                                                {/* <span className="pl-1 font-medium"> {e.src}</span> */}
                                            </div>
                                        </div>
                                    </td>
                                    {/* <td className="text-center">
										<span
											className={`font-medium ${
												e.state === "Settled" ? "text-skyblue-500" : "text-yellow-500"
											}`}
										>
											{e.state}
										</span>
									</td> */}
                                    <td className="text-center">
                                        <img
                                            id="exploer"
                                            alt="exploer"
                                            className="w-6 h-6 cursor-pointer mx-auto"
                                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAC4UlEQVR4Ae2WA6wcYRzE65hFXDeqbdu2bbdxatu2bdu2bdtupzOb913vtl1crZf8Vv//zM6Hd3eRAPxS/gf4H8CxkDdZxwrkGHmts+6djb5e62RQjsCOzehrtd4B8iXvfLxC5mlokHcLWhQ+gpakfp6NqJh52vVWRY7Hc3o5a5GLpO53pnymKeqXTnr6bEalLDNvsB7DK4BMYjfKt/0Dz3DhGelo03XVcw/dPvk7BZBJdLLLzaRgyp6aGV3fJokjdEk4ygeq8dqLnSSaU4DGXgZaz8Kp+qBx/p26f0eONM6/652eqaYeH9T7LIDWh1zyE0DkS9YJxdMOEbrWs3ACnCPR7AHqtSh8GLVzreKGmYVymSZZVMo6i89WQzUTwA31+PAR1QMBlIZreLN8pskom3HCF1GtYb6tnqNTj0+fkySKFaBWzhVDTEPD1jPQdcdSDH6wWljXDVrNMAYczUQUSzPI2gcFUnTnqDvpbN2XSDccPn1MiIqReBObU/ROD9uPmYfBT1agx+XZ6HxqitC1nqkWEOdL3gVF0wxE9RxLhK6tZ2UyjINfH81E80IHdylAF2KlW/PyMHbcP4HOJ6ag04nJBhpMlVijkjjwcn1YCRPC+Fx4exuP3jxDvzNz3HxEDwU4RKwpuvX6IfQ34OzcEKHQCNSjXo3UHqBU+lEwPg/ePsX7Dx8w7NwiNx9xRAFeEQy+vxpDLyzEhEsrrcYR55dg8NkFQemnqMcI339agsURox8P49P7zCwMPDvP0g09txALr29z8nkdEkBF03jk0XlsvXckVPggIHzGf7lH5Bo5r7MJYPdZdnMn7r9+7OTzNHgJND2m0WvqDtu+Q77ax2xCbQxtEG0UNXpuHluAr/aRMA55HMa/4WNpbAG+2seIy5IP1gjazLSmaPDD1ULXwYk/qFcaG1/tEywuR54QOPDE5eVf7WMXxyI9yFHyhjwjB0hX1Txe/lU+/3+W/w/wP8BHrC3DQabFPxAAAAAASUVORK5CYII="
                                            onClick={() =>
                                                window.open(
                                                    `${networkInfo[networkId].blockExplorerUrls}/tx/${
                                                        e.appendedTxid || e.settledTxid
                                                    }`,
                                                    "_blank"
                                                )
                                            }
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>
                {filteredHistory.length 
                    ?  <ul className="flex rounded justify-center w-full">
                            <li
                                className="inline-flex justify-center items-center px-[2px] rounded-l-md border-[0.2px] border-gray-500 w-7 h-7 hover:bg-gray-700 "
                                key={"prev"}
                            >
                                <img
                                    className="w-3 h-3"
                                    src={`/images/icon/left_arrow.svg`}
                                    alt="left_arrow"
                                    onClick={() => MoveSlot(false)}
                                />
                            </li>
                            {pages.map((e) => {
                                return (
                                    <li className="px-[2px] " key={e}>
                                        <p
                                            className={`inline-flex justify-center items-center border-[0.2px] border-gray-500 w-7 h-7 hover:bg-gray-700 hover:underline cursor-pointer ${
                                                currentPage === e + 1 ? "font-bold" : " font-light"
                                            } `}
                                            onClick={() => setCurrentPage(e + 1)}
                                        >
                                            {e * slot + 1}
                                        </p>
                                    </li>
                                );
                            })}
                            <li
                                className="inline-flex justify-center items-center px-[2px] rounded-r-md border-[0.2px] border-gray-500 w-7 h-7 hover:bg-gray-700 "
                                key={"next"}
                            >
                                <img
                                    className="w-3 h-3"
                                    src={`/images/icon/right_arrow.svg`}
                                    alt="left_arrow"
                                    onClick={() => MoveSlot(true)}
                                />
                            </li>
                        </ul>
                    : <div className="w-full h-8 text-sm flex items-center justify-center text-gray-300 font-medium">
                        <tr> 
                            <td rowSpan={8}>No Trade History...</td>
                        </tr>
                    </div>
                }
            </div>
        </div>
    );
};

export default Trades;
