/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "reducers";
import { getExchangeHistories } from "lib/thegraph/api";
import { formatCurrency } from "lib";
import { /* SUPPORTED_NETWORKS, */ isExchageNetwork } from "lib/network";
import { networkInfo } from "configure/networkInfo";
// import { changeNetwork } from "lib/network";

const OrderHistories = ({ balance }) => {
    const { address, isConnect, networkId } = useSelector((state: RootState) => state.wallet);
    const transaction = useSelector((state: RootState) => state.transaction);
    const [histories, setHistories] = useState([]);
    // const [currentPage, setCurrentPage] = useState(1);
    const [pages, setPages] = useState([]);

    const getPages = (size: number) => {
        let pageCount = Math.ceil(size / 10);
        pageCount = pageCount === 0 ? 1 : pageCount;
        let pages = [];
        for (let a = 0; a < pageCount; a++) {
            pages.push(a);
        }
        return pages;
    };

    const init = useCallback(async () => {
        const histories = await getExchangeHistories({ address, first: 5 });
        setHistories(histories);
        setPages(getPages(histories.length));
    }, [address, getExchangeHistories, setHistories]);

    useEffect(() => {
        if (address && !transaction.hash) {
            if (isExchageNetwork(networkId)) {
                init();
            } else {
                // changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID);
                setHistories([]);
            }
        }
    }, [balance, address, transaction, networkId]);

    useEffect(() => {
        if (!isConnect) {
            setHistories([]);
        }
    }, [isConnect]);

    return (
        <div className="items-center w-full h-fit grow-0 overflow-auto bg-blue-900 rounded-lg pt-1 px-2">
            <div className="flex w-full h-full">
                <div className="relative w-full h-full overflow-x-scroll scrollbar-hide">
                    <table className="table-auto mt-2 mb-2 w-full order-t border-b border-blue-950">
                        <thead className="border-t border-b border-blue-950 h-8">
                            <tr className="text-blue-300">
                                <th className="font-medium w-15">Chain</th>
                                <th className="font-medium">Date/Time</th>
                                <th className="font-medium">Received</th>
                                <th className="font-medium">Price</th>
                                <th className="font-medium">Paid</th>
                                <th className="font-medium text-center">Fee</th>
                                {/* <th className="font-medium">Action</th> */}
                                <th className="font-medium min-w-12">Details</th>
                            </tr>
                        </thead>
                        {histories.length > 0 ? (
                        <tbody className="text-[11.5px]">
                            {histories.map((e) => (
                                <tr className="h-[34px]" key={e.id}>
                                    <td className="flex justify-center">
                                        <img
                                            className="w-5 h-5 pr-1"
                                            src={`/images/network/${e.chainId}.svg`}
                                            alt="chainId"
                                        ></img>
                                    </td>
                                    <td className="text-center">
                                        <span>{e.date}</span>
                                    </td>
                                    <td className="text-center">
                                        <div className="flex justify-end left">
                                            <div className="flex ">
                                                    <img
                                                        className="w-5 h-5 pl-1"
                                                        src={`/images/currencies/${e.dest}.svg`}
                                                        alt="receive"
                                                    ></img>
                                            </div>
                                            <div className="flex ml-2">
                                                {formatCurrency(e.amountReceived, 8)}
                                               {/* <span className="pl-1 font-medium"> {e.dest}</span> */}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="flex justify-end left">
                                            <div className="flex ">
                                                <img
                                                    className="w-5 h-5 pl-1"
                                                    src={`/images/currencies/${e.src}.svg`}
                                                    alt="price"
                                                ></img>
                                            </div>
                                            <div className="flex ml-2">
                                                {formatCurrency(
                                                    ((e.amount - BigInt(e.exchangeFeeRate * e.amount) / 10n ** 18n) *
                                                        10n ** 18n) /
                                                        e.amountReceived,
                                                    5
                                                )}
                                               {/*  <span className="pl-1 font-medium"> {e.src}</span> */}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="justify-end">
                                        <div className="flex justify-end left">
                                            <div className="flex ">
                                                    <img
                                                        className="w-5 h-5 pl-1"
                                                        src={`/images/currencies/${e.src}.svg`}
                                                        alt="paid"
                                                    ></img>
                                            </div>
                                            <div className="flex ml-2">
                                                {formatCurrency(e.amount, 8)}
                                                {/* <span className="pl-1 font-medium"> {e.src}</span> */}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="flex justify-end left">
                                            <div className="flex ">
                                                    <img
                                                        className="w-5 h-5 pl-1"
                                                        src={`/images/currencies/pUSD.svg`}
                                                        alt="fee"
                                                    ></img>
                                            </div>
                                            <div className="flex ml-2">
                                                {formatCurrency(BigInt(e.exchangeFeeRate * e.amount) / 10n ** 18n, 8)}
                                                {/* <span className="pl-1 font-medium">pUSD</span> */}
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
                                                    `${networkInfo[e.chainId].blockExplorerUrls}/tx/${
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
                        ) : (
                            <div className="absolute top-0 w-full h-full text-sm flex border-b items-center justify-center border-gray-500 text-gray-300 font-medium">
                                <span>No Trade History...</span>
                            </div>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
};
export default OrderHistories;
