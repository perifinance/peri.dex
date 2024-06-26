/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "reducers";
import { getExchangeHistories } from "lib/thegraph/api";
import { formatCurrency } from "lib";
import { /* SUPPORTED_NETWORKS, */ isExchageNetwork } from "lib/network";
import { networkInfo } from "configure/networkInfo";
import { useMediaQuery } from "react-responsive";
// import { changeNetwork } from "lib/network";

type OrderHistoriesProps = {
    balance: any;
    isBuy?: boolean;
};

const OrderHistories = ({ balance, isBuy }:OrderHistoriesProps) => {
    const selectWallet = (state: RootState) => state.wallet;
    const { address, isConnect, networkId } = useSelector(selectWallet);

    const selectTransaction = (state: RootState) => state.transaction;
    const transaction = useSelector(selectTransaction);

    const [histories, setHistories] = useState([]);
    const isLaptop = useMediaQuery({ query: `(min-height: 768px)` });
    
    // const [currentPage, setCurrentPage] = useState(1);
    // const [pages, setPages] = useState([]);

    /* const getPages = (size: number) => {
        let pageCount = Math.ceil(size / 10);
        pageCount = pageCount === 0 ? 1 : pageCount;
        let pages = [];
        for (let a = 0; a < pageCount; a++) {
            pages.push(a);
        }
        return pages;
    }; */

    const getHistories = useCallback(async () => {
            const histories = await getExchangeHistories({ address, first: isLaptop ? 5 : 4 });
            setHistories(histories);
        // console.log("histories", histories);
        // setPages(getPages(histories.length));
    }, [address, networkId]);

    useEffect(() => {
        // console.log("OrderHistories useEffect", balance, isConnect, transaction);
        if (isConnect && !transaction.hash) {
            if (isExchageNetwork(networkId)) {
                getHistories();
            } else {
                // changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID);
                setHistories([]);
            }
        } else if (!isConnect) {
            setHistories([]);
        }
    }, [balance, getHistories, transaction, isConnect]);

/*     useEffect(() => {
        if (!isConnect) {
            setHistories([]);
        }
    }, [isConnect]); */

    return (
        <div className={`items-center w-full h-full grow-0 rounded-lg pt-1 px-2 ${
            isBuy ? "from-cyan-950 to-blue-950" : "from-red-950 to-blue-950"
        } bg-gradient-to-br `}>
            <div className="flex w-full h-full">
                <div className="relative w-full h-full flex items-center">
                    <table className="h-[90%] w-full">
                        <thead className="border-b-[0.01px] border-blue-750 h-8">
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
                                        <td className="flex justify-center items-center h-full">
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
                                                        ((e.amount -
                                                            BigInt(e.exchangeFeeRate * e.amount) / 10n ** 18n) *
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
                                                    {formatCurrency(
                                                        BigInt(e.exchangeFeeRate * e.amount) / 10n ** 18n,
                                                        8
                                                    )}
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
                            <tbody className="text-sm text-blue-200 font-normal">
                                <tr className="h-[150px]">
                                    <td colSpan={7} className="text-center">
                                        No Trade History...
                                    </td>
                                </tr>
                            </tbody>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
};
export default OrderHistories;
