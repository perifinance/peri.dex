import { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "reducers";
// import { getLastRates } from "lib/thegraph/api";
import { getBalance } from "lib/balance";
import { getFeeRateForExchange } from "lib/rates";
import { useContracts } from "lib";
// import { formatCurrency } from "lib";
import { updateTransaction } from "reducers/transaction";
import { getNetworkFee } from "lib/fee";
// import { setSelectedCoin } from "reducers/coin/selectedCoin";
import { SUPPORTED_NETWORKS, isExchageNetwork } from "lib/network";
import { NotificationManager } from "react-notifications";
import { networkInfo } from "configure/networkInfo";
// import { updateLastRateData } from "reducers/rates";
import { useMediaQuery } from "react-responsive";
import "css/Order.css";
import { toWei } from "web3-utils";
import { toBytes32, toBigInt, toBigNumber } from "lib/bigInt";
import { extractMessage } from "lib/error";
// import useSelectedCoin from "hooks/useSelectedCoin";
import TickerBar from "./TickerBar";
import useSelectedCoin from "hooks/useSelectedCoin";
// import { TokenInput } from "components/TokenInput";
import InputPenal from "./InputPenal";
import SelectBar from "./SelectBar";
import FeeInfoBar from "./FeeInfoBar";
// import { resetChartData } from "reducers/chart/chart";

type OrderProps = {
    openCoinList: Function;
    balance: any;
    // coinListType?: any;
    setBalance: Function;
    isCoinList?: boolean;
    closeCoinList?: Function;
    isBuy?: boolean;
    setIsBuy?: (value: boolean) => void;
};

const Order = ({ isCoinList, closeCoinList, openCoinList, balance, setBalance, isBuy, setIsBuy }: OrderProps) => {
    const dispatch = useDispatch();
    const { isReady } = useSelector((state: RootState) => state.app);
    const { networkId, address, isConnect } = useSelector((state: RootState) => state.wallet);
    const [{ selectedCoins }] = useSelectedCoin();
    const { source, destination } = selectedCoins;
    const { listSize } = useSelector((state: RootState) => state.coinList);
    const isOrderMin = useMediaQuery({ query: `(min-height: 880px)` });
    const isLaptop = useMediaQuery({ query: `(min-height: 768px)` });
    const [{ contracts }] = useContracts();

    // const [sourceRate, setSourceRate] = useState(0n);
    // const [per, setPer] = useState(0n);
    // const [isPayCoin, setIsPayCoin] = useState(false);
    const [payAmount, setPayAmount] = useState("");
    const [receiveAmount, setReceiveAmount] = useState("");

    const [feeRate, setFeeRate] = useState(0n);

    const [gasPrice, setGasPrice] = useState("0");
    const [gasLimit, setGasLimit] = useState(0n);

    const [isPending, setIsPending] = useState(false);
    const [isValidation, setIsValidation] = useState(false);
    const [validationMessage, setValidationMessage] = useState("");

    // const [idxTarget, setIdxTarget] = useState(1);

    // Todo: Implement the following functions when neeeded
    /* const getRate = useCallback(async () => {
        try {
            if (!isExchageNetwork(networkId) || !destination.symbol) {
                return;
            }

            const rates = await getLastRates([source.symbol, destination.symbol]);
            if (rates === undefined) return;

            const tmp = { src: { price: 10n ** 18n, timestamp: 0 }, dest: { price: 10n ** 18n, timestamp: 0 } };
            const twoCoin = {};
            rates.forEach((item) => {
                if (`p${item.currencyKey}` === source.symbol) {
                    tmp.src.price = item.price;
                    tmp.src.timestamp = item.timestamp;
                } else {
                    tmp.dest.price = item.price;
                    tmp.dest.timestamp = item.timestamp;
                }
                twoCoin[item.currencyKey] = item.price;
            });
            const timeStamp = tmp.src.timestamp > tmp.dest.timestamp ? tmp.src.timestamp : tmp.dest.timestamp;
            const lastRateData = {
                timestamp: timeStamp,
                rate: (tmp.dest.price * 10n ** 18n) / tmp.src.price,
                symbols: `${source.symbol}/${destination.symbol}`,
            };

            dispatch(updateLastRateData(lastRateData));
            dispatch(updatePrice(twoCoin));
            setSourceRate(tmp.src.price);
        } catch (e) {
            console.error("getRate error", e);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCoins]); */

    const getFeeRate = useCallback(async () => {
        if (!source?.symbol || !destination?.symbol) return;
        try {
            const feeRate = await getFeeRateForExchange(source.symbol, destination.symbol);
            console.debug("getFeeRate", feeRate);
            setFeeRate(feeRate);
        } catch (e) {
            console.warn(e);
        }
    }, [destination?.symbol, source?.symbol]);

    const getSourceBalance = async () => {
        if (!isConnect) {
            NotificationManager.info("Please connect your wallet");
            return;
        }

        console.debug("getSourceBalance", isBuy);

        await Promise.all([
            getBalance(address, source.symbol ?? "pUSD", 18),
            getBalance(address, destination.symbol ?? "pBTC", 18),
        ]).then((res) => setBalance(res));
    };

    const validationCheck = (value) => {
        try {
            setIsValidation(false);
            setValidationMessage("Make profit, earn rewards!");

            if (!isConnect) {
                setValidationMessage("Please connect your wallet");
            } else if (!isExchageNetwork(networkId)) {
                setValidationMessage(
                    `You just connected an unsupported netowork. Please switch to either polygon or moonriver.`
                );
                // changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID);
            } else if (Number(value) === 0) {
                setValidationMessage("Enter amount to exchange the symbol");
            } else if (isNaN(Number(value))) {
                setValidationMessage("Please enter numbers only!");
            } else if (balance.length && toBigInt(value) > balance[isBuy ? 0 : 1]) {
                setValidationMessage("Insufficient balance");
            } else if (source.symbol === destination.symbol) {
                setValidationMessage("Cannot exchange same currencies");
            } else {
                setIsValidation(true);
            }
        } catch (e) {
            console.warn(e);
            setIsValidation(true);
            // setValidationMessage("");
        }
    };

    // const changePayAmount = useCallback(
    //     (amount: number | string, isPay: boolean=!isBuy) => {
    //         try {
    //             amount = amount === "." ? "0." : amount;
    //             const receiveAmtNoFee =
    //                 isPay === isBuy
    //                     ? (toBigInt(amount) * 10n ** 18n) / toBigInt(coinList[idxTarget].price)
    //                     : (toBigInt(amount) * toBigInt(coinList[idxTarget].price)) / 10n ** 18n;

    //             // console.log("changePayAmount", amount, receiveAmtNoFee, coinList[idxTarget]);
    //             const feePrice = (receiveAmtNoFee * feeRate) / 10n ** 18n;

    //             const calcAmt = receiveAmtNoFee + feePrice * (isPay ? -1n : 1n);
    //             const payAmount = isPay ? amount.toString() : fromBigNumber(calcAmt);
    //             const receiveAmount = isPay ? fromBigNumber(calcAmt) : amount.toString();

    //             validationCheck(payAmount);

    //             // console.debug("changePayAmount", amount, payAmount, feePrice, receiveAmount);
    //             setPayAmount(payAmount);
    //             setReceiveAmount(receiveAmount);
    //             setIsPayCoin(isPay);
    //             setInputAmt(amount);
    //         } catch (e) {
    //             // setPayAmountToUSD(0n);
    //             isBuy ? setReceiveAmount("") : setPayAmount("");
    //         }
    //     },
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    //     [feeRate, coinList[idxTarget]]
    // );

    // const changeAmountByPay = (value) => changePayAmount(value, true);
    // const changeAmountByBuy = (value) => changePayAmount(value, false);

    // const getNetworkFeePrice = useCallback(async () => {
    //     if (nativeIndex === -1 || gasPrice === "0") return;

    //     try {
    //         const nativePrice = toBigInt(coinList[nativeIndex].price);
    //         const gLimit = gasLimit === 0n ? await getGasLimit() : gasLimit;
    //         const feePrice = (gLimit * BigInt(toWei(gasPrice, "gwei")) * nativePrice) / 10n ** 18n;
    //         // console.debug("feePrice", feePrice, gLimit, gasPrice, nativePrice);
    //         setNetworkFeePrice(feePrice);
    //     } catch (e) {}
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [feePrice, nativeIndex, gasPrice]);

    // const getPrice = useCallback(() => {
    //     if (payAmount === "0") {
    //         setPrice(0n);
    //         setFeePrice(0n);
    //         return;
    //     }
    //     try {
    //         const price = toBigInt(Number(payAmount) * coinList[idxTarget].price);
    //         console.debug("getPrice", price, "feeRate", feeRate);
    //         setPrice(price);
    //         setFeePrice((price * feeRate) / 10n ** 18n);
    //     } catch (e) {
    //         setPrice(0n);
    //         setFeePrice(0n);
    //     }
    // }, [payAmount, feeRate]);

    const getGasLimit = async () => {
        let gasLimit = 1400000n;

        console.debug("gasLimit", gasLimit, selectedCoins, payAmount, contracts);

        const coins = [
            selectedCoins?.source?.symbol ? source.symbol : "pUSD",
            selectedCoins?.destination?.symbol ? destination.symbol : "pBTC",
        ].map(toBytes32);

        console.debug("getGasEstimate", coins[isBuy ? 0 : 1], coins[isBuy ? 1 : 0], payAmount);
        try {
            gasLimit = BigInt(
                await contracts.signers.PeriFinance.estimateGas.exchange(
                    coins[isBuy ? 0 : 1],
                    ["0", ""].includes(payAmount) ? 1n : toBigNumber(payAmount),
                    coins[isBuy ? 1 : 0]
                )
            );
        } catch (e) {
            console.warn(e);
            // NotificationManager.warning("No pUSD is available to exchange in your wallet.");
        }

        gasLimit = (gasLimit * 125n) / 100n;
        console.debug("gasLimit", gasLimit);
        // setGasLimit(gasLimit);
        return gasLimit;
    };

    const order = async () => {
        if (!isValidation) {
            const message = !isConnect ? "Please Connect your wallet" : validationMessage;
            NotificationManager.warning(message);
            return false;
        }

        setIsPending(true);

        if (!isExchageNetwork(networkId)) {
            NotificationManager.warning(
                `${networkInfo[networkId].chainName} is not supported. Please change to ${
                    networkInfo[process.env.REACT_APP_DEFAULT_NETWORK_ID].chainName
                }`,
                "Warning"
            );
            // changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID);
            return false;
        }

        const transactionSettings = {
            gasPrice: toWei(gasPrice, "gwei"),
            gasLimit: gasLimit === 0n ? await getGasLimit() : gasLimit,
        };

        const srcCoin = isBuy ? source : destination;
        const destCoin = isBuy ? destination : source;

        console.debug("order", srcCoin, destCoin, payAmount, transactionSettings);

        try {
            let transaction;
            transaction = await contracts.signers.PeriFinance.exchange(
                toBytes32(srcCoin.symbol),
                toBigNumber(payAmount),
                toBytes32(destCoin.symbol),
                transactionSettings
            );

            dispatch(
                updateTransaction({
                    hash: transaction.hash,
                    message: `${isBuy ? "Buying" : "Selling"} ${destination.symbol}...`,
                    type: "Exchange",
                    action: () => {
                        getSourceBalance();
                        setPayAmount("");
                        validationCheck("");
                        // setPer(0n);
                        // setPayAmountToUSD(0n);
                        setReceiveAmount("");
                        setIsPending(false);
                    },
                    error: () => {
                        setIsPending(false);
                    },
                })
            );
        } catch (e) {
            console.warn(e);
            setIsPending(false);
            NotificationManager.warning(extractMessage(e));
        }
    };

    /* const swapToCurrency = () => {
        if (!isExchageNetwork(networkId)) {
            NotificationManager.warning(`This network is not supported. Please change to moonriver network`, "ERROR");
            // changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID);
            return false;
        }
        const { source, destination } = selectedCoins;

        dispatch(setSelectedCoin({ source: destination, destination: source }));
    }; */

    const setNetworkFee = async () => {
        try {
            const [fee, gLimit] = await Promise.all([getNetworkFee(networkId), gasLimit ? gasLimit : getGasLimit()]);
            console.debug("setNetworkFee", fee, "gasLimit", gLimit);

            setGasPrice(fee);
            setGasLimit(gLimit);
            // setNetworkRate(rate);
        } catch (e) {}
    };

    // const setPerAmount = (per) => {
    //     console.debug("per", per);

    //     const selBalance = balance.length ? balance[isBuy ? 0 : 1] : 0n;

    //     setPer(per);
    //     const convertPer = per > 0n ? (100n * 10n) / per : 0n;
    //     const perBalance = convertPer > 0n ? (selBalance * 10n) / convertPer : 0n;
    //     changePayAmount(fromBigNumber(perBalance), true);
    // };

    // useEffect(() => {
    //     const idx = symbolMap[source.symbol];

    //     idx && setSourceRate(coinList[idx].price);

    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [symbolMap[source.symbol]]);

    useEffect(() => {
        // dispatch(setLoading({ name: "balance", value: true }));
        console.debug("Order useEffect", isReady, networkId, listSize);

        if (isReady && networkId && listSize > 0) {
            setNetworkFee();
        }

        // dispatch(setLoading({ name: "balance", value: false }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, networkId, listSize]);


    // useEffect(() => {
    //     if (Number(inputAmt) !== 0) changePayAmount(inputAmt, isPayCoin);
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [changePayAmount]);

    useEffect(() => {
        if (isReady && SUPPORTED_NETWORKS[networkId]) {
            getFeeRate();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, networkId, getFeeRate]);


    useEffect(() => {
        if (isReady && isConnect && address) {
            if (isExchageNetwork(networkId)) {
                getSourceBalance();
            } else {
                setBalance([0n, 0n]);
            } /* else { */
            validationCheck("0");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, networkId, isConnect, address, isBuy, selectedCoins]);

   /*  useEffect(() => {
        if (destination.symbol) {
            const idx = symbolMap[destination.symbol];
            console.log("symbolMap", symbolMap, destination.symbol, idx);
            setIdxTarget(idx);
        }

    }, [destination, symbolMap]); */

    return (
        <div className={`w-full h-full`}>
            <div
                className={`w-full h-fit rounded-lg px-4 lg:h-full lg:flex lg:flex-col lg:justify-between bg-gradient-to-tl ${
                    isBuy ? "from-cyan-950 to-cyan-950" : "from-red-950 to-red-950"
                } via-blue-900 xs:mt-2 xs:pt-1 md:mt-0 md:pt-0`}
            >
                <div className={`flex flex-col lg:gap-3 lg:mt-3`}>
                    <SelectBar isBuy={isBuy} setIsBuy={setIsBuy} /> 
                    <TickerBar 
                        isBuy={isBuy} 
                        openCoinList={openCoinList} 
                        isCoinList={isCoinList} 
                        closeCoinList={closeCoinList} 
                    />
                    <InputPenal
                        isBuy={isBuy}
                        feeRate={feeRate}
                        balance={balance}
                        payAmount={payAmount}
                        receiveAmount={receiveAmount}
                        setPayAmount={setPayAmount}
                        setReceiveAmount={setReceiveAmount}
                        validationCheck={validationCheck}
                    />
                </div>
                <div className="flex flex-col justify-between pb-4">
                    <FeeInfoBar
                        isBuy={isBuy}
                        gasPrice={gasPrice}
                        gasLimit={gasLimit}
                        feeRate={feeRate}
                        payAmount={isBuy? receiveAmount : payAmount}
                        receiveAmount={isBuy? payAmount : receiveAmount}
                        isPending={isPending}
                        order={order}
                        getGasLimit={getGasLimit}
                    />
                    {/* <div className="flex flex-col-reverse lg:flex-col">
                        <div
                            className={`flex gap-3 justify-between flex-row lg:flex-col text-[11px] lg:text-sm ${
                                isLaptop && "text-xs "
                            }`}
                        >
                            <div className="hidden lg:flex justify-between w-[40%] lg:w-full">
                                <div>Cost</div>
                                <div className="font-medium">${formatCurrency(price - feePrice, 18)}</div>
                            </div>
                            <div className="flex justify-between w-[40%] lg:w-full">
                                <div>Fee</div>
                                <div className="flex flex-nowrap items-center">
                                    <span className="font-medium">${formatCurrency(feePrice, 6)}</span>
                                    <span className="font-light text-[10px] tracking-tighter text-nowrap">
                                        ({fromBigNumber(feeRate * 100n)}%)
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between w-[40%] lg:w-full">
                                <span>GAS</span>
                                <div className="flex flex-nowrap items-center">
                                    <span className="font-medium">${formatCurrency(networkFeePrice, 5)}</span>
                                    <span className="font-light text-[10px] tracking-tighter text-nowrap">{`( ${
                                        Number(gasPrice) < 1 ? Number(gasPrice).toFixed(4) : gasPrice
                                    } GWEI) `}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            className={`flex flex-row border-[1px] rounded-md items-center mt-3 lg:mt-6 lg:my-6 mb-4 px-4 py-2 w-full font-medium ${
                                isLaptop && "lg:mt-14"
                            } hover:bg-gradient-to-l bg-gradient-to-t active:bg-gradient-to-tr ${
                                isBuy
                                    ? "from-cyan-450/10 border-cyan-450 text-cyan-450 "
                                    : "from-red-400/10 border-red-400 text-red-400"
                            } to-blue-950`}
                            onClick={() => order()}
                            disabled={isPending}
                        >
                            <div className="flex basis-1/3 justify-end pr-2">
                                {isPending && (
                                    <svg
                                        className={`animate-spin h-5 w-5 ${isBuy ? "text-cyan-450" : "text-red-400"}`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                )}
                            </div>
                            <span className="basis-1/3 text-lg text-nowrap">{`${isBuy ? "Buy" : "Sell"} ${
                                destination.symbol ? destination.symbol : "pBTC"
                            }`}</span>
                        </button>
                    </div> */}
                    <div
                        className={`hidden bg-blue-950 w-full text-center break-wards rounded-lg text-xs font-medium py-3 px-2 ${
                            isLaptop ? (isOrderMin ? "h-20 lg:block" : "lg:block") : ""
                        } bg-gradient-to-tl ${isBuy ? "from-skyblue-900" : "from-red-400/10"} to-blue-950`}
                    >
                        {!isConnect
                            ? "Please Connect your wallet"
                            : isExchageNetwork(networkId)
                            ? validationMessage
                            : "Unsupported Network"}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Order;
