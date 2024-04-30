import { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "reducers";
import { getLastRates, getBalances } from "lib/thegraph/api";
import { getFeeRateForExchange } from "lib/rates";
import { contracts } from "lib";
import { formatCurrency } from "lib";
import { updateTransaction } from "reducers/transaction";
import { getNetworkFee } from "lib/fee";
import { getNetworkPrice } from "lib/price";
import { setSelectedCoin } from "reducers/coin/selectedCoin";
import { SUPPORTED_NETWORKS, isExchageNetwork } from "lib/network";
import { NotificationManager } from "react-notifications";
import { setLoading } from "reducers/loading";
import { networkInfo } from "configure/networkInfo";
import { getSafeSymbol } from "lib/coinList";
import { updateLastRateData } from "reducers/rates";
import { useMediaQuery } from "react-responsive";
import "./Order.css";
import RangeInput from "./RangeInput";
import { updatePrice } from "reducers/coin/coinList";
import { toWei } from "web3-utils";
import { toBytes32, toBigInt, toBigNumber, fromBigNumber } from "lib/bigInt";
import { extractMessage } from "lib/error";
// import { resetChartData } from "reducers/chart/chart";

type OrderProps = {
    openCoinList: Function;
    balance: any;
    coinListType: any;
    setBalance: Function;
    isCoinList?: Boolean;
    closeCoinList?: Function;
};

const Order = ({ isCoinList, closeCoinList, openCoinList, coinListType, balance, setBalance }: OrderProps) => {
    const dispatch = useDispatch();
    const { isReady } = useSelector((state: RootState) => state.app);
    const { networkId, address, isConnect } = useSelector((state: RootState) => state.wallet);
    const selectedCoins = useSelector((state: RootState) => state.selectedCoin);
    const { lastRateData } = useSelector((state: RootState) => state.exchangeRates);
    const { coinList } = useSelector((state: RootState) => state.coinList);
    const isOrderMin = useMediaQuery({ query: `(min-height: 880px)` });
    const isLaptop = useMediaQuery({ query: `(min-height: 768px)` });

    const [sourceRate, setSourceRate] = useState(0n);
    const [per, setPer] = useState(0n);

    const [feeRate, setFeeRate] = useState(0n);
    const [networkFeePrice, setNetworkFeePrice] = useState(0n);
    const [gasPrice, setGasPrice] = useState("0");
    // const [gasLimit, setGasLimit] = useState(0n);
    const [price, setPrice] = useState(0n);
    const [networkRate, setNetworkRate] = useState(0n);
    const [feePrice, setFeePrice] = useState(0n);

    const [payAmount, setPayAmount] = useState("0");
    const [payAmountToUSD, setPayAmountToUSD] = useState(0n);
    const [receiveAmount, setReceiveAmount] = useState(0n);
    // const [balance, setBalance] = useState(0n);
    const [isPending, setIsPending] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isValidation, setIsValidation] = useState(false);
    const [validationMessage, setValidationMessage] = useState("");

    const getRate = useCallback(async () => {
        try {
            if (!isExchageNetwork(networkId) || !selectedCoins.destination.symbol) {
                return;
            }

            const rates = await getLastRates([selectedCoins.source.symbol, selectedCoins.destination.symbol]);
            if (rates === undefined) return;

            const tmp = { src: { price: 10n ** 18n, timestamp: 0 }, dest: { price: 10n ** 18n, timestamp: 0 } };
            const twoCoin = {};
            rates.forEach((item) => {
                if (`p${item.currencyKey}` === selectedCoins.source.symbol) {
                    tmp.src.price = item.price;
                    tmp.src.timestamp = item.timestamp;
                } else {
                    tmp.dest.price = item.price;
                    tmp.dest.timestamp = item.timestamp;
                }
                twoCoin[item.currencyKey] = item.price;
            });

            /* console.log(
                "getRate src, dest",
                selectedCoins.source.symbol,
                selectedCoins.destination.symbol,
                tmp.src,
                tmp.dest
            ); */

            const timeStamp = tmp.src.timestamp > tmp.dest.timestamp ? tmp.src.timestamp : tmp.dest.timestamp;
            const lastRateData = {
                timestamp: timeStamp,
                rate: (tmp.dest.price * 10n ** 18n) / tmp.src.price,
                symbols: `${selectedCoins.source.symbol}/${selectedCoins.destination.symbol}`,
            };

            dispatch(updateLastRateData(lastRateData));
            dispatch(updatePrice(twoCoin));
            setSourceRate(tmp.src.price);
            console.log("getRate", rates, tmp.src.price, tmp.dest.price);
        } catch (e) {
            console.error("getRate error", e);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCoins]);

    const getFeeRate = useCallback(async () => {
        if (!selectedCoins.source.symbol || !selectedCoins.destination.symbol) return;
        try {
            const feeRate = await getFeeRateForExchange(selectedCoins.source.symbol, selectedCoins.destination.symbol);
            console.log("getFeeRate", feeRate);
            setFeeRate(feeRate);
        } catch (e) {
            console.log(e);
        }
    }, [selectedCoins.destination.symbol, selectedCoins.source.symbol]);

    const getSourceBalance = async () => {
        if (!isConnect) {
            NotificationManager.info("Please connect your wallet");
            return;
        }

        setIsRefreshing(true);
        const balance: any = await getBalances({
            address,
            networkId,
            currencyName: selectedCoins.source.symbol ?? "pUSD",
        });

        setBalance(balance || 0n);
        setIsRefreshing(false);
    };

    const validationCheck = (value) => {
        try {
            setIsValidation(false);
            setValidationMessage("Make profit, earn rewards!");

            if (!isConnect) {
                setValidationMessage("Please connect your wallet");
            } else if (!isExchageNetwork(networkId)) {
                console.log("validationCheck", networkId);
                setValidationMessage(
                    `You just connected an unsupported netowork. Please switch to either polygon or moonriver.`
                );
                // changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID);
            } else if (Number(value) === 0) {
                setValidationMessage("Enter amount to exchange the symbol");
            } else if (isNaN(Number(value))) {
                setValidationMessage("Please enter numbers only!");
            } else if (toBigInt(value) > balance) {
                setValidationMessage("Insufficient balance");
            } else if (selectedCoins.source.symbol === selectedCoins.destination.symbol) {
                setValidationMessage("Cannot exchange same currencies");
            } else {
                setIsValidation(true);
            }
        } catch (e) {
            console.log(e);
            setIsValidation(true);
            // setValidationMessage("");
        }
    };

    const changePayAmount = (value) => {
        validationCheck(value);
        setPayAmount(value);
        try {
            setPayAmountToUSD((toBigInt(value) * sourceRate) / 10n ** 18n);
            const exchangeAmount = (toBigInt(value) * 10n ** 18n) / lastRateData.rate;
            // console.log("changePayAmount", value, exchangeAmount, lastRateData.rate);
            const feePrice = (exchangeAmount * feeRate) / 10n ** 18n;
            setReceiveAmount(exchangeAmount - feePrice);
        } catch (e) {
            setPayAmountToUSD(0n);
            setReceiveAmount(0n);
        }
    };

    const getNetworkFeePrice = useCallback( async () => {
        try {
            const gasLimit = await getGasLimit();
            const feePrice = gasLimit * BigInt(toWei(gasPrice, "gwei")) * networkRate / 10n ** 18n;
            console.log("feePrice", feePrice, gasLimit, gasPrice, networkRate);
            setNetworkFeePrice(feePrice);
        } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gasPrice, networkRate]);

    const getPrice = useCallback(() => {
        if (payAmount === "0") {
            setPrice(0n);
            setFeePrice(0n);
            return;
        }
        try {
            const price = (toBigInt(payAmount) * sourceRate) / 10n ** 18n;
            console.log("getPrice", price, "feeRate", feeRate);
            setPrice(price);
            setFeePrice((price * feeRate) / 10n ** 18n);
        } catch (e) {
            setPrice(0n);
            setFeePrice(0n);
        }
    }, [payAmount, sourceRate, feeRate]);

    const getGasLimit = async () => {
        let gasLimit = 860000n;

        const coins = [
            selectedCoins.source.symbol ? selectedCoins.source.symbol : "pUSD",
            selectedCoins.destination.symbol ? selectedCoins.destination.symbol : "pBTC",
        ].map(toBytes32);

        // console.log("getGasEstimate", coins, toBigNumber(payAmount === "0" ? "1" : payAmount));

        try {
            gasLimit = BigInt(
                await contracts.signers.PeriFinance.estimateGas.exchange(
                    coins[0],
                    toBigNumber(payAmount === "0" ? "1" : payAmount),
                    coins[1]
                )
            );
            
        } catch (e) {
            // NotificationManager.warning("No pUSD is available to exchange in your wallet.");
        }

        gasLimit = (gasLimit * 11n) / 10n;
        console.log("gasLimit", gasLimit);
        // setGasLimit(gasLimit);
        return gasLimit;
    };

    const order = async () => {
        if (!isValidation) {
            NotificationManager.warning(validationMessage);
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
            gasLimit: await getGasLimit(),
        };

        // console.log(
        //     "symbol",
        //     toBytes32(selectedCoins.destination.symbol)
        // );

        try {
            let transaction;
            transaction = await contracts.signers.PeriFinance.exchange(
                toBytes32(selectedCoins.source.symbol),
                toBigNumber(payAmount),
                toBytes32(selectedCoins.destination.symbol),
                transactionSettings
            );

            dispatch(
                updateTransaction({
                    hash: transaction.hash,
                    message: `Buy ${selectedCoins.destination.symbol} from ${selectedCoins.source.symbol}`,
                    type: "Exchange",
                    action: () => {
                        getSourceBalance();
                        setPayAmount("0");
                        validationCheck("0");
                        setPer(0n);
                        setPayAmountToUSD(0n);
                        setReceiveAmount(0n);
                        setIsPending(false);
                    },
                    error: () => {
                        setIsPending(false);
                    },
                })
            );
        } catch (e) {
            console.log(e);
            setIsPending(false);
            NotificationManager.warning(extractMessage(e));
        }
    };

    const swapToCurrency = () => {
        if (!isExchageNetwork(networkId)) {
            NotificationManager.warning(`This network is not supported. Please change to moonriver network`, "ERROR");
            // changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID);
            return false;
        }
        const { source, destination } = selectedCoins;

        dispatch(setSelectedCoin({ source: destination, destination: source }));
    };

    const setNetworkFee = async () => {
        try {
            const [fee, rate] = await Promise.all([getNetworkFee(networkId), getNetworkPrice(networkId)]);
            console.log("setNetworkFee", fee, "networkRate", rate);

            setGasPrice(fee);
            setNetworkRate(rate);
            return rate;
        } catch (e) {}
    };

    const setPerAmount = (per) => {
        // console.log("per", per);

        setPer(per);
        const convertPer = per > 0n ? (100n * 10n) / per : 0n;
        const perBalance = convertPer > 0n ? (balance * 10n) / convertPer : 0n;
        changePayAmount(fromBigNumber(perBalance));
    };

    useEffect(() => {
            // setTimeout(getRate, 500);
            getRate();
            const timeout = setInterval(() => {
                getRate();
            }, 1000 * 60);
            return () => clearInterval(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, getRate]);

    useEffect(() => {
        const source = coinList.find((coin) => coin.symbol === selectedCoins.source.symbol);
        // console.log("sourceCoin", source);

        source && setSourceRate(source.price);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [coinList]);

    useEffect(() => {
        dispatch(setLoading({ name: "balance", value: true }));
        // console.log("useEffect", isReady, networkId, selectedCoins);

        if (isReady && networkId) {
            setNetworkFee();
            
        }

        dispatch(setLoading({ name: "balance", value: false }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, networkId, lastRateData]);

    useEffect(() => {
        getPrice();
    }, [getPrice]);

    useEffect(() => {
        if (isReady && SUPPORTED_NETWORKS[networkId]) {
            // console.log("getFeeRate");
            getFeeRate();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, networkId, getFeeRate]);

    useEffect(() => {
        // console.log("getNetworkFeePrice");
        if (isReady && SUPPORTED_NETWORKS[networkId]) {
            
            getNetworkFeePrice();
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [networkRate]);

    useEffect(() => {
        if (isReady && isConnect && address) {
            if (isExchageNetwork(networkId)) {
                getSourceBalance();
            } else {
                // changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID);
                setPayAmount("0");
                setPayAmountToUSD(0n);
                setReceiveAmount(0n);
                setBalance(0n);
                setPer(0n);
            }
            validationCheck("0");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, networkId, isConnect, address, selectedCoins]);

/*     useEffect(() => {
        if (!isConnect || selectedCoins) {
            setPayAmount("0");
            validationCheck("0");
            setPayAmountToUSD(0n);
            setReceiveAmount(0n);
            setBalance(0n);
            setPer(0n);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnect, selectedCoins]); */

    return (
        <div className={`w-full h-full `}>
            <div
                className={`w-full bg-blue-900 rounded-t-lg px-4 hidden lg:flex ${
                    isLaptop ? "lg:h-[9%]" : "lg:h-[12%]"
                }`}
            >
                <div className="flex space-x-1 py-2 items-end">
                    <div className="relative w-14 h-8">
                        <img
                            alt="dest_symgol"
                            className="w-8 h-8 absolute bottom-0 left-0 z-[2]"
                            src={`/images/currencies/${getSafeSymbol(selectedCoins.destination.symbol, false)}.svg`}
                        ></img>
                        <img
                            alt="source_symgol"
                            className="w-8 h-8 absolute bottom-0 left-4 z-[1]"
                            src={`/images/currencies/${getSafeSymbol(selectedCoins.source.symbol)}.svg`}
                        ></img>
                    </div>
                    <div className="text-lg font-medium tracking-tighter ml-0 text-center">
                        {getSafeSymbol(selectedCoins.destination.symbol, false)} /{" "}
                        {getSafeSymbol(selectedCoins.source.symbol)}
                    </div>
                </div>
            </div>
            <div
                className={`w-full h-fit lg:h-[88%] bg-blue-900 lg:rounded-b-lg px-4 ${
                    isLaptop && "lg:h-[91%]"
                } lg:flex lg:flex-col lg:justify-around `}
            >
                <div className={`flex flex-col `}>
                    <div className="flex justify-between">
                        <div className="flex items-center space-x-1 pl-1 justify-start w-full text-xs">
                            <div className="flex flex-nowrap text-gray-400">
                                <span className="">Available:</span>
                                <span className="font-medium">{` ${formatCurrency(balance, 4)}`}</span>
                            </div>
                            <img
                                className={`m-1 p-1 w-[16px] rounded-full bg-blue-600 cursor-pointer ${
                                    isRefreshing && "animate-spin"
                                }`}
                                src={`/images/icon/refresh.svg`}
                                alt="refresh"
                                onClick={() => getSourceBalance()}
                            />
                        </div>
                        <div className="flex justify-end items-center font-medium tracking-tight text-xs w-full text-blue-600 px-3">
                            <span>${formatCurrency(payAmountToUSD, 2)}</span>
                        </div>
                    </div>
                    {/* ${isError && 'border border-red-500'} */}
                    <div className="flex rounded-md bg-blue-950 text-base p-2 space-x-4 justify-between">
                        <div
                            id="list-caller"
                            className="flex font-medium cursor-pointer items-center"
                            onClick={() => (isCoinList ? closeCoinList() : openCoinList("source"))}
                        >
                            <img
                                id="list-caller"
                                className="w-6 h-6"
                                alt="target-symbol"
                                src={`/images/currencies/${getSafeSymbol(selectedCoins.source.symbol)}.svg`}
                            ></img>
                            <div id="list-caller" className=" flex items-center flex-nowrap arrow-turn">
                                <span id="list-caller" className="m-1 text-sm tracking-tighter">
                                    {getSafeSymbol(selectedCoins.source.symbol)}
                                </span>
                                <img
                                    id="list-caller"
                                    alt="arrow"
                                    className={`w-3 h-[6px] ${
                                        isCoinList && coinListType === "source" && "rotate-[-90deg]"
                                    }`}
                                    src={`/images/icon/bottom_arrow.png`}
                                />
                            </div>
                        </div>
                        <input
                            className="w-2/3 bg-blue-950 outline-none text-gray-300 font-medium text-right"
                            type="text"
                            value={payAmount}
                            placeholder="0"
                            onChange={(e) => {
                                changePayAmount(e.target.value);
                                setPer(0n);
                            }}
                            onFocus={(e) => e.target.select()}
                        />
                    </div>

                    <div
                        className="flex w-7 h-7 lg:w-9 lg:h-9 my-2 lg:my-3 bg-blue-950 rounded-full mx-auto cursor-pointer"
                        onClick={() => swapToCurrency()}
                    >
                        <div className="m-auto">
                            <img alt="execute" className="w-4 h-5 align-middle" src={"/images/icon/exchange.png"}></img>
                        </div>
                    </div>
                    <div className="flex rounded-md bg-blue-950 text-base p-2 space-x-4 justify-between">
                        <div
                            id="list-caller"
                            className="flex font-medium cursor-pointer items-center"
                            onClick={() => (isCoinList ? closeCoinList() : openCoinList("destination"))}
                        >
                            <img
                                id="list-caller"
                                alt="dest-symbol"
                                className="w-6 h-6"
                                src={`/images/currencies/${getSafeSymbol(selectedCoins.destination.symbol, false)}.svg`}
                            ></img>
                            <div id="list-caller" className=" flex items-center flex-nowrap arrow-turn">
                                <span id="list-caller" className="m-1 text-sm tracking-tighter">
                                    {getSafeSymbol(selectedCoins.destination.symbol, false)}
                                </span>
                                <img
                                    id="list-caller"
                                    alt="arrow"
                                    className={`w-3 h-[6px] ${
                                        isCoinList && coinListType === "destination" && "rotate-[-90deg]"
                                    }`}
                                    src={`/images/icon/bottom_arrow.png`}
                                />
                            </div>
                        </div>
                        <input
                            className="w-2/3 bg-blue-950 outline-none text-gray-300 font-medium text-right"
                            type="text"
                            value={formatCurrency(receiveAmount, 8)}
                            disabled
                        />
                    </div>
                    <div className={`${isLaptop && "lg:mt-7"}`}>
                        <RangeInput per={per} setPerAmount={setPerAmount} divide={4} />
                    </div>
                </div>
                <div className="flex flex-col justify-between pb-4">
                    <div className="flex flex-col-reverse lg:flex-col">
                        <div className={`text-[11px] lg:text-sm ${isLaptop && "text-xs "}`}>
                            <div className="flex justify-between w-full">
                                <span>GAS Fee</span>
                                <div className="flex flex-nowrap items-center">
                                    <span className="font-medium">${formatCurrency(networkFeePrice, 5)}</span>
                                    <span className="font-light text-[10px] tracking-tighter text-nowrap">{`( ${
                                        Number(gasPrice) < 1 ? Number(gasPrice).toFixed(4) : gasPrice
                                    } GWEI) `}</span>
                                </div>
                            </div>
                            <div className="flex pt-3 justify-between w-full">
                                <div>Rate</div>
                                <div>1 = {formatCurrency(lastRateData.rate, 8)}</div>
                            </div>
                            <div className="flex pt-3 justify-between w-full">
                                <div>Cost: </div>
                                <div>${formatCurrency(price - feePrice, 18)}</div>
                            </div>

                            <div className="flex pt-3 justify-between w-full">
                                <div>Fee({fromBigNumber(feeRate * 100n)}%)</div>
                                <div>${formatCurrency(feePrice, 6)}</div>
                            </div>

                            {/* {BigInt(receiveAmount) > 0n && isValidation && (
                                <>
                                    <div className="flex py-2 justify-between w-full">
                                        <div>Cost: </div>
                                        <div>${formatCurrency(price - feePrice, 18)}</div>
                                    </div>

                                    <div className="flex py-2 justify-between w-full">
                                        <div>Fee({fromBigNumber(feeRate * 100n)}%)</div>
                                        <div>${formatCurrency(feePrice, 6)}</div>
                                    </div>
                                </>
                            )} */}
                        </div>
                        <button
                            className={`btn-base flex flex-row items-center mt-6 lg:my-6 mb-4 px-4 py-2 w-full ${
                                isLaptop && "lg:mt-14"
                            }`}
                            onClick={() => order()}
                            disabled={isPending}
                        >
                            <div className="flex basis-1/3 justify-end pr-2">
                                {isPending && (
                                    <svg
                                        className="animate-spin h-5 w-5 text-blue-600"
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
                            <span className="basis-1/3 text-lg">Confirm</span>
                        </button>
                    </div>
                    {/* {!isValidation || !isConnect ? ( */}
                    <div
                        className={`hidden bg-blue-950 w-full text-center break-wards text-blue-600 rounded-lg text-xs font-medium py-3 px-2 ${
                            isLaptop ? (isOrderMin ? "h-20 lg:block" : "lg:block") : ""
                        }`}
                    >
                        {!isConnect
                            ? "Please Connect your wallet"
                            : isExchageNetwork(networkId)
                            ? validationMessage
                            : "Unsupported Network"}
                    </div>
                </div>
                {/*  ) : (
                    <></>
                )} */}
            </div>
        </div>
    );
};
export default Order;
