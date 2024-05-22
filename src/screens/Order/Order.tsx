import { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "reducers";
// import { getLastRates } from "lib/thegraph/api";
import { getBalance } from "lib/balance";
import { getFeeRateForExchange } from "lib/rates";
import { useContracts } from "lib";
import { formatCurrency } from "lib";
import { updateTransaction } from "reducers/transaction";
import { getNetworkFee } from "lib/fee";
import { getNetworkPrice } from "lib/price";
// import { setSelectedCoin } from "reducers/coin/selectedCoin";
import { SUPPORTED_NETWORKS, isExchageNetwork } from "lib/network";
import { NotificationManager } from "react-notifications";
import { setLoading } from "reducers/loading";
import { natives, networkInfo } from "configure/networkInfo";
import { getSafeSymbol } from "lib/coinList";
// import { updateLastRateData } from "reducers/rates";
import { useMediaQuery } from "react-responsive";
import "css/Order.css";
import RangeInput from "./RangeInput";
// import { updatePrice } from "reducers/coin/coinList";
import { toWei } from "web3-utils";
import { toBytes32, toBigInt, toBigNumber, fromBigNumber } from "lib/bigInt";
import { extractMessage } from "lib/error";
// import { resetChartData } from "reducers/chart/chart";

type OrderProps = {
    openCoinList: Function;
    balance: any;
    coinListType?: any;
    setBalance: Function;
    isCoinList?: boolean;
    closeCoinList?: Function;
    isBuy?: boolean;
    setIsBuy?: Function;
};

const Order = ({ isCoinList, closeCoinList, openCoinList, balance, setBalance, isBuy, setIsBuy }: OrderProps) => {
    const dispatch = useDispatch();
    const { isReady } = useSelector((state: RootState) => state.app);
    const { networkId, address, isConnect } = useSelector((state: RootState) => state.wallet);
    const selectedCoins = useSelector((state: RootState) => state.selectedCoin);
    const { lastRateData } = useSelector((state: RootState) => state.exchangeRates);
    const { coinList } = useSelector((state: RootState) => state.coinList);
    const isOrderMin = useMediaQuery({ query: `(min-height: 880px)` });
    const isLaptop = useMediaQuery({ query: `(min-height: 768px)` });
    const [{ contracts }] = useContracts();

    const [sourceRate, setSourceRate] = useState(0n);
    const [per, setPer] = useState(0n);

    const [feeRate, setFeeRate] = useState(0n);
    const [networkFeePrice, setNetworkFeePrice] = useState(0n);
    const [gasPrice, setGasPrice] = useState("0");
    const [gasLimit, setGasLimit] = useState(0n);
    // const [gasLimit, setGasLimit] = useState(0n);
    const [price, setPrice] = useState(0n);
    // const [networkRate, setNetworkRate] = useState(0n);
    const [feePrice, setFeePrice] = useState(0n);

    const [payAmount, setPayAmount] = useState("");
    // const [payAmountToUSD, setPayAmountToUSD] = useState(0n);
    const [receiveAmount, setReceiveAmount] = useState("");
    // const [balance, setBalance] = useState(0n);
    const [isPending, setIsPending] = useState(false);
    const [isValidation, setIsValidation] = useState(false);
    const [validationMessage, setValidationMessage] = useState("");
    // const [isBuy, setIsBuy] = useState(true);
    const [isPayCoin, setIsPayCoin] = useState(false);
    const [inputAmt, setInputAmt] = useState<string | number>("");
    const [nativeIndex, setNativeIndex] = useState(-1);

    // Todo: Implement the following functions when neeeded
    /* const getRate = useCallback(async () => {
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
            const timeStamp = tmp.src.timestamp > tmp.dest.timestamp ? tmp.src.timestamp : tmp.dest.timestamp;
            const lastRateData = {
                timestamp: timeStamp,
                rate: (tmp.dest.price * 10n ** 18n) / tmp.src.price,
                symbols: `${selectedCoins.source.symbol}/${selectedCoins.destination.symbol}`,
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
        if (!selectedCoins.source?.symbol || !selectedCoins.destination?.symbol) return;
        try {
            const feeRate = await getFeeRateForExchange(selectedCoins.source.symbol, selectedCoins.destination.symbol);
            console.debug("getFeeRate", feeRate);
            setFeeRate(feeRate);
        } catch (e) {
            console.log(e);
        }
    }, [selectedCoins.destination?.symbol, selectedCoins.source?.symbol]);

    const getSourceBalance = async () => {
        if (!isConnect) {
            NotificationManager.info("Please connect your wallet");
            return;
        }

        console.debug("getSourceBalance", isBuy);

        await Promise.all([
            getBalance(address, selectedCoins.source.symbol?? "pUSD", 18),
            getBalance(address, selectedCoins.destination.symbol ?? "pBTC", 18),
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
            } else if (balance.length && (toBigInt(value) > balance[isBuy?0:1])) {
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

    const changePayAmount = useCallback((amount: number | string, isPay: boolean) => {
            try {
                amount = amount === "." ? "0." : amount;
                const receiveAmtNoFee =
                    isPay === isBuy
                        ? (toBigInt(amount) * 10n ** 18n) / lastRateData.rate
                        : (toBigInt(amount) * lastRateData.rate) / 10n ** 18n;

                // console.log("changePayAmount", amount, receiveAmtNoFee, lastRateData.rate);
                const feePrice = (receiveAmtNoFee * feeRate) / 10n ** 18n;

                const calcAmt = receiveAmtNoFee + feePrice * (isPay ? -1n : 1n);
                const payAmount = isPay ? amount.toString() : fromBigNumber(calcAmt);
                const receiveAmount = isPay ? fromBigNumber(calcAmt) : amount.toString();

                validationCheck(payAmount);

                // console.debug("changePayAmount", amount, payAmount, feePrice, receiveAmount);
                setPayAmount(payAmount);
                setReceiveAmount(receiveAmount);
                setIsPayCoin(isPay);
                setInputAmt(amount);
            } catch (e) {
                // setPayAmountToUSD(0n);
                isBuy ? setReceiveAmount("") : setPayAmount("");
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [feeRate, lastRateData.rate]
    );

    const getNetworkFeePrice = useCallback(async () => {
        console.log("getNetworkFeePrice", nativeIndex);
        if (nativeIndex === -1 || !coinList[nativeIndex] ) return;

        console.log("getNetworkFeePrice", nativeIndex, coinList[nativeIndex]);

        try {
            const nativePrice = coinList[nativeIndex].price;
            const gLimit = gasLimit === 0n ? await getGasLimit() : gasLimit;
            const feePrice = (gLimit * BigInt(toWei(gasPrice, "gwei")) * nativePrice) / 10n ** 18n;
            // console.debug("feePrice", feePrice, gLimit, gasPrice, nativePrice);
            setNetworkFeePrice(feePrice);
        } catch (e) {}
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [feePrice, nativeIndex]);

    const getPrice = useCallback(() => {
        if (payAmount === "0") {
            setPrice(0n);
            setFeePrice(0n);
            return;
        }
        try {
            const price = (toBigInt(payAmount) * sourceRate) / 10n ** 18n;
            console.debug("getPrice", price, "feeRate", feeRate);
            setPrice(price);
            setFeePrice((price * feeRate) / 10n ** 18n);
        } catch (e) {
            setPrice(0n);
            setFeePrice(0n);
        }
    }, [payAmount, sourceRate, feeRate]);

    const getGasLimit = async () => {
        let gasLimit = 1400000n;

        console.debug("gasLimit", gasLimit, selectedCoins, payAmount, contracts);

        const coins = [
            selectedCoins?.source?.symbol ? selectedCoins.source.symbol : "pUSD",
            selectedCoins?.destination?.symbol ? selectedCoins.destination.symbol : "pBTC",
        ].map(toBytes32);

        console.debug("getGasEstimate", coins[isBuy ? 0 : 1], coins[isBuy ? 1 : 0], payAmount );
        try {
            gasLimit = BigInt(
                await contracts.signers.PeriFinance.estimateGas.exchange(
                    coins[isBuy ? 0 : 1],
                    ["0", ""].includes(payAmount) ? 1n : toBigNumber(payAmount),
                    coins[isBuy ? 1 : 0]
                )
            );
        } catch (e) {
            console.log(e);
            // NotificationManager.warning("No pUSD is available to exchange in your wallet.");
        }

        gasLimit = (gasLimit * 11n) / 10n;
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

        const srcCoin = isBuy ? selectedCoins.source : selectedCoins.destination;
        const destCoin = isBuy ? selectedCoins.destination : selectedCoins.source;

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
                    message: `${isBuy ? "Buying" : "Selling"} ${selectedCoins.destination.symbol}...`,
                    type: "Exchange",
                    action: () => {
                        getSourceBalance();
                        setPayAmount("");
                        validationCheck("");
                        setPer(0n);
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
            console.log(e);
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
            const [fee, gasLimit] = await Promise.all([getNetworkFee(networkId), getGasLimit()]);
            console.debug("setNetworkFee", fee, "gasLimit", gasLimit);

            setGasPrice(fee);
            setGasLimit(gasLimit);
            // setNetworkRate(rate);
        } catch (e) {}
    };

    const setPerAmount = (per) => {
        console.debug("per", per);

        const selBalance = balance.length ? balance[isBuy ? 0 : 1] : 0n;

        setPer(per);
        const convertPer = per > 0n ? (100n * 10n) / per : 0n;
        const perBalance = convertPer > 0n ? (selBalance * 10n) / convertPer : 0n;
        changePayAmount(fromBigNumber(perBalance), true);
    };
/* 
    useEffect(() => {
        
        const source = coinList.find((coin) => coin.symbol === selectedCoins.source.symbol);

        source && setSourceRate(source.price);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [coinList]); */

    useEffect(() => {
        // dispatch(setLoading({ name: "balance", value: true }));
        console.debug("Order useEffect", isReady, networkId, coinList.length);

        if (isReady && networkId && coinList.length > 0) {
            setNetworkFee();
        }
        if (coinList.length > 0) {
            const index = coinList.findIndex(
                (coin) => coin.key === natives[networkId]
            );
            console.debug("index", index)
            setNativeIndex(index);
        }

        // dispatch(setLoading({ name: "balance", value: false }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, networkId, coinList.length]);

    useEffect(() => {
        getPrice();
    }, [getPrice]);

    useEffect(() => {
        if (Number(inputAmt) !== 0) changePayAmount(inputAmt, isPayCoin);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [changePayAmount]);

    useEffect(() => {
        if (isReady && SUPPORTED_NETWORKS[networkId]) {
            getFeeRate();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, networkId, getFeeRate]);

    useEffect(() => {
        if (isReady && SUPPORTED_NETWORKS[networkId]) {
            getNetworkFeePrice();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getNetworkFeePrice]);

    useEffect(() => {
        if (isReady && isConnect && address) {
            if (isExchageNetwork(networkId)) {
                getSourceBalance();
            } else {
                setBalance([0n,0n]);
            } /* else { */
            // changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID);
            setPayAmount("");
            // setPayAmountToUSD(0n);
            setReceiveAmount("");
            
            setPer(0n);
            /* } */
            validationCheck("0");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, networkId, isConnect, address, isBuy, selectedCoins]);

    return (
        <div className={`w-full h-full`}>
            {/*<div
                className={`h-full w-full bg-blue-850 rounded-t-lg px-4 hidden lg:hidden items-center ${
                    isLaptop ? "lg:h-[9%]" : "lg:h-[12%]"
                }`}
            >
                 <div
                    className="flex space-x-1 cursor-pointer w-full h-full justify-between items-center"
                    id="list-caller"
                    onClick={() => (isCoinList ? closeCoinList() : openCoinList("destination"))}
                >
                    <div className="flex flex-col w-[38%] justify-center pt-3" id="list-caller">
                        <div className={`text-2xl font-medium tracking-wide text-center w-full ${
                            coinList[lastRateData.index]?.upDown 
                                ? coinList[lastRateData.index]?.upDown > 0 
                                    ? "text-blue-500" 
                                    : "text-red-400" 
                                : "text-gray-300"
                            }`}
                            id="list-caller"
                        >
                            {formatCurrency(coinList[lastRateData.index]?.price, 8)}
                        </div>
                        <div className={`flex flex-row text-[10px] ss:text-xs justify-between ${
                                coinList[lastRateData.index]?.change !== 0n 
                                    ? coinList[lastRateData.index]?.change > 0n 
                                        ? "text-blue-500" 
                                        : "text-red-400" 
                                    : "text-gray-300"
                            } font-[500]`} id="list-caller"
                        >
                            <div className="" id="list-caller">
                                {`${coinList[lastRateData.index]?.change > 0n ? "+" : ""}${
                                    coinList[lastRateData.index]?.preClose > 0n ? 
                                        formatCurrency(coinList[lastRateData.index]?.price - coinList[lastRateData.index]?.preClose, 8)
                                        : "0"
                                }`}
                            </div>
                            <div className={``} 
                                id="list-caller"
                            >
                                {`${coinList[lastRateData.index] ? (coinList[lastRateData.index]?.change > 0n && "+") : ""}${
                                    formatCurrency(coinList[lastRateData.index]?.change, 2)}%`}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col w-[25%] min-w-fit mt-2 items-center justify-between" >
                        <div className="w-full flex flex-col justify-start" >
                            <div className={`text-[6px] ss:text-[8px] text-gray-450 font-medium tracking-tight text-start w-full`}>
                                {`24h high`}
                            </div>
                            <div className={`text-[10px] ss:text-xs font-medium tracking-wide text-start w-full`}>
                                {`${formatCurrency(coinList[lastRateData.index]?.high, 8)}`}
                            </div>
                        </div>
                        <div className="w-full flex flex-col justify-end" >
                            <div className={`text-[6px] ss:text-[8px] text-gray-450 font-medium tracking-tight text-start w-full`}>
                                {`24h low`}
                            </div>
                            <div className={`text-[10px] ss:text-xs font-medium tracking-wide text-start w-full`}>
                                {`${formatCurrency(coinList[lastRateData.index]?.low, 8)}`}
                            </div>
                        </div>
                    </div>
                </div>
            </div> */}
            <div
                className={`w-full h-fit rounded-lg px-4 lg:h-full lg:flex lg:flex-col lg:justify-between bg-gradient-to-tl ${
                    isBuy ? "from-cyan-950 to-cyan-950" : "from-red-950 to-red-950"
                } via-blue-900 xs:mt-2 xs:pt-1 md:mt-0 md:pt-0`}
            >
                <div className={`flex flex-col lg:gap-3 lg:mt-3`}>
                    <div className="flex flex-row justify-between items-center m-2 lg:my-4">
                        <button
                            className={`w-[48%] bg-transparent border-2 cursor-pointer p-2 hover:bg-gradient-to-l ${
                                isBuy
                                    ? "bg-gradient-to-t active:bg-gradient-to-tr from-cyan-450/10 to-blue-950 border-cyan-450 text-cyan-450 font-medium border-[1px]"
                                    : "border-blue-950 hover:from-cyan-450/10 hover:to-blue-950"
                            } hover:text-cyan-450 hover:font-medium rounded-md`}
                            onClick={() => {
                                setPayAmount("");
                                setReceiveAmount("");
                                setIsBuy(true);
                            }}
                        >
                            Buy
                        </button>
                        <button
                            className={`w-[48%] bg-transparent border-2 cursor-pointer p-2 hover:bg-gradient-to-l ${
                                isBuy
                                    ? "border-blue-950 hover:from-red-400/20 hover:to-blue-950"
                                    : "bg-gradient-to-t active:bg-gradient-to-tr from-red-400/20 to-blue-950 border-red-400 text-red-400 font-medium border-[1px]"
                            } hover:text-red-400 hover:font-medium rounded-md`}
                            onClick={() => {
                                setPayAmount("");
                                setReceiveAmount("");
                                setIsBuy(false);
                            }}
                        >
                            Sell
                        </button>
                    </div>

                    <div
                        className={`flex flex-col rounded-lg lg:my-1 py-2 lg:py-3 bg-gradient-to-tl ${
                            isBuy ? "from-cyan-450/10" : "from-red-400/10"
                        } to-blue-950`}
                    >
                        <div className="flex space-x-1 cursor-pointer w-full h-full justify-between items-center" id="list-caller">
                            <div 
                                className="flex flex-col w-[50%] justify-center" 
                                id="list-caller"
                                onClick={() => (isCoinList ? closeCoinList() : openCoinList("destination"))}
                            >
                                <div className="flex space-x-1 mb-2 items-end cursor-pointer justify-center"
                                    id="list-caller"
                                >
                                    <div className="relative w-8 h-5"
                                        id="list-caller"
                                    >
                                        <img
                                            id="list-caller"
                                            alt="dest_symgol"
                                            className="w-4 h-4 md:w-5 md:h-5 absolute bottom-0 left-0 z-[2]"
                                            src={`/images/currencies/${selectedCoins.destination?.symbol ? getSafeSymbol(selectedCoins.destination.symbol, false): "pBTC"}.svg`}
                                        ></img>
                                        <img
                                            alt="source_symgol"
                                            className="w-4 h-4 md:w-5 md:h-5 absolute bottom-0 left-3 z-[1]"
                                            src={`/images/currencies/${selectedCoins.source?.symbol ? getSafeSymbol(selectedCoins.source.symbol) : "pUSD"}.svg`}
                                        ></img>
                                    </div>
                                    <div className="text-[12px] font-medium tracking-tighter mr-1 text-center" id="list-caller">
                                        {getSafeSymbol(selectedCoins.destination.symbol, false)} /{" "}
                                        {getSafeSymbol(selectedCoins.source.symbol)}
                                    </div>
                                    <div className="transform-gpu m-auto" id="list-caller">
                                        <img className="w-3 h-3 align-middle rotate-90" src={"/images/icon/exchange.png"} alt="netswap" />
                                    </div>
                                </div>
                                <div
                                    className={`text-2xl font-bold tracking-wide text-center w-full ${
                                        coinList[lastRateData.index]?.upDown
                                            ? coinList[lastRateData.index]?.upDown > 0
                                                ? "text-blue-500"
                                                : "text-red-400"
                                            : "text-gray-300"
                                    }`}
                                    id="list-caller"
                                >
                                    {formatCurrency(coinList[lastRateData.index]?.price, 8)}
                                </div>
                                <div
                                    className={`flex flex-row text-[10px] ss:text-xs justify-center gap-8 ${
                                        coinList[lastRateData.index]?.change !== 0n
                                            ? coinList[lastRateData.index]?.change > 0n
                                                ? "text-blue-500"
                                                : "text-red-400"
                                            : "text-gray-300"
                                    } font-[500]`}
                                    id="list-caller"
                                >
                                    <div className="" id="list-caller">
                                        {`${coinList[lastRateData.index]?.change > 0n ? "+" : ""}${
                                            coinList[lastRateData.index]?.preClose > 0n
                                                ? formatCurrency(
                                                    coinList[lastRateData.index]?.price - coinList[lastRateData.index]?.preClose, 8
                                                )
                                                : "0"
                                        }`}
                                    </div>
                                    <div className={``} id="list-caller">
                                        {`${
                                            (coinList[lastRateData.index] && coinList[lastRateData.index].change > 0n)
                                                ? "+"
                                                : ""
                                        }${formatCurrency(coinList[lastRateData.index]?.change, 2)}%`}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col w-[25%] min-w-fit items-center space-y-2 lg:space-y-4">
                                <div className="w-full flex flex-col justify-start">
                                    <div
                                        className={`h-4 text-[6px] ss:text-[8px] text-gray-450 font-medium tracking-tight text-start w-full`}
                                    >
                                        {`24h high`}
                                    </div>
                                    <div
                                        className={`text-[10px] ss:text-xs font-medium tracking-wide text-start w-full`}
                                    >
                                        {`${formatCurrency(coinList[lastRateData.index]?.high, 8)}`}
                                    </div>
                                </div>
                                <div className="w-full flex flex-col justify-end">
                                    <div
                                        className={`h-4 text-[6px] ss:text-[8px] text-gray-450 font-medium tracking-tight text-start w-full`}
                                    >
                                        {`24h low`}
                                    </div>
                                    <div
                                        className={`text-[10px] ss:text-xs font-medium tracking-wide text-start w-full`}
                                    >
                                        {`${formatCurrency(coinList[lastRateData.index]?.low, 8)}`}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* <div className="flex pt-3 justify-between w-full rounded-md bg-blue-950 text-gray-450 font-medium text-base p-2">
                            <div>Price</div>
                            <div className="w-[70%] text-right ">{formatCurrency(lastRateData.rate, 8)}</div>
                        </div> */}
                    </div>
                    <div className="flex flex-col w-full mt-2 lg:mt-3 space-y-1 lg:space-y-2">
                        {/* <div className="flex items-center space-x-1 pl-1 justify-start w-full text-xs mt-2">
                            <div className="flex flex-nowrap text-gray-400">
                                <span className="mr-2">Available:</span>
                                <span className="font-medium">{`${formatCurrency(balance, 4)} ${
                                    isBuy
                                        ? selectedCoins?.source?.symbol
                                            ? getSafeSymbol(selectedCoins.source.symbol)
                                            : "pUSD"
                                        : selectedCoins?.destination?.symbol
                                        ? getSafeSymbol(selectedCoins.destination.symbol, false)
                                        : "pBTC"
                                }`}</span>
                            </div>
                            <img
                                className={`m-1 p-1 w-[16px] rounded-full bg-blue-600 cursor-pointer ${
                                    isRefreshing && "animate-spin"
                                }`}
                                src={`/images/icon/refresh.svg`}
                                alt="refresh"
                                onClick={() => getSourceBalance()}
                            />
                        </div> */}
                        <div className={`flex rounded-lg relative bg-blue-950 border-[1px] ${ 
                                isBuy ? "border-cyan-950" : "border-red-950"
                            } text-base py-1 px-2 space-x-2 justify-around h-20`}>
                            <div className="flex flex-col font-medium justify-start items-center w-[68%] pl-1">
                                <span className="flex font-medium w-full text-[10px] text-left text-gray-450/50">{`${isBuy ? "Buy":"Sell"} Amount`}</span>
                                <input
                                    id="tartget-symbol"
                                    className=" bg-blue-950  outline-none text-gray-300 font-medium text-left w-full"
                                    type="text"
                                    placeholder="0"
                                    value={isBuy ? receiveAmount : payAmount}
                                    onChange={(e) => {
                                        const value = ["", "00"].includes(e.target.value) ? "0" : e.target.value;
                                        changePayAmount(value, !isBuy);
                                        setPer(0n);
                                    }}
                                    onFocus={(e) => {
                                        setInputAmt("");
                                        e.target.select();
                                    }}
                                    onBlur={(e) => setInputAmt(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col items-end w-[28%] justify-center space-x-2">
                                <div className="flex font-medium cursor-pointer items-center text-gray-450">
                                    <img
                                        alt="dest-symbol"
                                        className="w-[18px] h-[18px]"
                                        src={`/images/currencies/${getSafeSymbol(
                                            selectedCoins.destination.symbol,
                                            false
                                        )}.svg`}
                                    ></img>
                                    <div className=" flex items-center flex-nowrap arrow-turn">
                                        <span className="m-1 text-sm tracking-tighter">
                                            {getSafeSymbol(selectedCoins.destination.symbol, false)}
                                        </span>
                                        {/* <img
                                            alt="arrow"
                                            className={`w-3 h-[6px] xl:hidden ${
                                                isCoinList && coinListType === "destination" && "rotate-[-90deg]"
                                            }`}
                                            src={`/images/icon/bottom_arrow.png`}
                                        /> */}
                                    </div>
                                </div>
                                <div className="flex flex-nowrap text-[10px] text-gray-450/60 absolute right-4 bottom-1">
                                    <span className="mr-2">Balance:</span>
                                    <span className="font-medium">{`${balance.length > 0 ? formatCurrency(balance[1], 4) : ""}`}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className={`flex rounded-lg relative bg-blue-950 border-[1px] ${ 
                                isBuy ? "border-cyan-950" : "border-red-950"
                            } text-base py-1 px-2 space-x-2 justify-around h-20`}>
                            <div className="flex flex-col font-medium justify-start items-center w-[68%] pl-1">
                                <span className="flex font-medium w-full text-[10px] text-left text-gray-450/50">{`${isBuy ? "Pay":"Receive"} Amount`}</span>
                                <input
                                    id="base-symbol"
                                    className="bg-blue-950 outline-none text-gray-300 font-medium text-left w-full"
                                    type="text"
                                    value={isBuy ? payAmount : receiveAmount}
                                    placeholder="0"
                                    onChange={(e) => {
                                        const value = ["", "00"].includes(e.target.value) ? "0" : e.target.value;
                                        changePayAmount(value, isBuy);
                                        setPer(0n);
                                    }}
                                    /* onFocus={(e) => {e.target.select();}} */
                                    onFocus={(e) => {
                                        setInputAmt("");
                                        e.target.select();
                                    }}
                                    onBlur={(e) => setInputAmt(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col items-end w-[28%] justify-center space-x-2">
                                <div className="flex font-medium cursor-pointer items-center text-gray-450">
                                    <img
                                        id="list-caller"
                                        className="w-[18px] h-[18px]"
                                        alt="source-symbol"
                                        src={`/images/currencies/${getSafeSymbol(selectedCoins.source.symbol)}.svg`}
                                    ></img>
                                    <div id="list-caller" className=" flex items-center flex-nowrap arrow-turn">
                                        <span id="list-caller" className="m-1 text-sm tracking-tighter">
                                            {getSafeSymbol(selectedCoins.source.symbol)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-nowrap text-[10px] text-gray-450/60 absolute right-4 bottom-1">
                                    <span className="mr-2">Balance:</span>
                                    <span className="font-medium">{`${balance.length > 0 ? formatCurrency(balance[0], 4) : ""}`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`${isLaptop && "lg:my-3"}`}>
                        <RangeInput
                            per={per}
                            setPerAmount={setPerAmount}
                            divide={4}
                            bgColor={isBuy ? "bg-cyan-450" : "bg-red-400"}
                            color={isBuy ? "text-cyan-450" : "text-red-400"}
                        />
                    </div>
                    {/* <div className="flex rounded-md bg-blue-950 border-[1px] border-gray-200/5 text-base p-2 space-x-4 justify-between">
                        <div id="list-caller" className="flex font-medium cursor-default items-center text-gray-450">
                            <img
                                id="list-caller"
                                className="w-[18px] h-[18px]"
                                alt="source-symbol"
                                src={`/images/currencies/${getSafeSymbol(selectedCoins.source.symbol)}.svg`}
                            ></img>
                            <div id="list-caller" className=" flex items-center flex-nowrap arrow-turn">
                                <span id="list-caller" className="m-1 text-sm tracking-tighter">
                                    {getSafeSymbol(selectedCoins.source.symbol)}
                                </span>
                            </div>
                        </div>
                        <input
                            id="base-symbol"
                            className="w-2/3 bg-blue-950 outline-none text-gray-300 font-medium text-right"
                            type="text"
                            value={isBuy ? payAmount : receiveAmount}
                            placeholder="0"
                            onChange={(e) => {
                                const value = ["", "00"].includes(e.target.value) ? "0" : e.target.value;
                                changePayAmount(value, isBuy);
                                setPer(0n);
                            }}
                            onFocus={(e) => {
                                setInputAmt("");
                                e.target.select();
                            }}
                            onBlur={(e) => setInputAmt(e.target.value)}
                        />
                    </div> */}
                </div>
                <div className="flex flex-col justify-between pb-4">
                    <div className="flex flex-col-reverse lg:flex-col">
                        <div className={`flex gap-3 justify-between flex-row lg:flex-col text-[11px] lg:text-sm ${isLaptop && "text-xs "}`}>
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
                                selectedCoins.destination.symbol ? selectedCoins.destination.symbol : "pBTC"
                            }`}</span>
                        </button>
                    </div>
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
