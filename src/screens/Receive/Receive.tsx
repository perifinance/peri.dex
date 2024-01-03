import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "reducers";
import { contracts, formatCurrency } from "lib";
import { SUPPORTED_NETWORKS, MAINNET, TESTNET } from "lib/network";
import { getNetworkFee } from "lib/fee";
import { updateTransaction } from "reducers/transaction";
import { getNetworkPrice } from "lib/price";
import { changeNetwork } from "lib/network";
import { NotificationManager } from "react-notifications";
import pynths from "configure/coins/bridge";
// import { logger } from "ethers";
import { setLoading } from "reducers/loading";
import { networkInfo } from "configure/networkInfo";
import { is } from "date-fns/locale";
import { set } from "date-fns";

const Receive = (_altclassName) => {
    const dispatch = useDispatch();
    const { isReady } = useSelector((state: RootState) => state.app);
    const { address, networkId, isConnect } = useSelector((state: RootState) => state.wallet);
    const [receiveDatas, setReceiveDatas] = useState({});
    const [totalAmount, setTotalAmount] = useState(0n);
    const [networks, setNetworks] = useState([]);
    const [isNetworkList, setIsNetworkList] = useState(false);
    const [selectedNetwork, setSelectedNetwork] = useState<{ name?: string; id?: Number }>({});
    const [isCoinList, setIsCoinList] = useState(false);
    const [selectedCoin, setSelectedCoin] = useState<{ name?: string; id?: Number }>({});
    const [networkFeePrice, setNetworkFeePrice] = useState<bigint>(0n);
    const [gasPrice, setGasPrice] = useState(0n);
    const [isPending, setIsPending] = useState(false);
    const [isValidation, setIsValidation] = useState(false);
    const [validationMessage, setValidationMessage] = useState("");

    const validationCheck = () => {
        setIsValidation(false);
        if (!isConnect) {
            setValidationMessage("Please connect your wallet");
        } else if (selectedNetwork && networkId !== selectedNetwork?.id) {
            setValidationMessage("Please select destination network");
        } else if (selectedCoin && totalAmount === 0n) {
            setValidationMessage("There is no pending amount");
        } else {
            setValidationMessage("Check PERI or pUSD on each network");
            setIsValidation(true);
        }
    };

    const initNetworks = async (chainId) => {
        const network = Object.keys(MAINNET).includes(chainId.toString()) ? MAINNET : TESTNET;
        const networks = Object.keys(SUPPORTED_NETWORKS)
            .filter((e) => Object.keys(network).includes(e))
            .map((e) => {
                return { name: SUPPORTED_NETWORKS[e], id: Number(e) };
            });
        setNetworks(networks);
    };

    const getInboundings = async () => {
        const contractName = {
            PERI: "BridgeState",
            pUSD: "BridgeStatepUSD",
        };
        try {
            const ids = await contracts[contractName[selectedCoin.name]].applicableInboundIds(
                address
            );

            let datas = [];
            let totalAmount = 0n;
            for (let id of ids) {
                let inbounding = await contracts[contractName[selectedCoin.name]].inboundings(id);
                const amount = BigInt(inbounding.amount);
                totalAmount = totalAmount + amount;
                datas.push({
                    amount,
                    chainId: inbounding.srcChainId.toString(),
                });
            }
            let promiseData = await Promise.all(datas);
            const network = Object.keys(MAINNET).includes(networkId.toString()) ? MAINNET : TESTNET;
            let returnValue = Object.keys(network).reduce((a, b) => ((a[b] = 0n), a), {});

            promiseData.forEach((data) => {
                if (returnValue[data.chainId]) {
                    returnValue[data.chainId] = returnValue[data.chainId] + data.amount;
                } else {
                    returnValue[data.chainId] = data.amount;
                }
            });
            setTotalAmount(totalAmount);
            setReceiveDatas(returnValue);
        } catch (e) {
            console.log(e);
        }
    };

    const getGasEstimate = async () => {
        const contractName = {
            PERI: "PeriFinance",
            pUSD: "pUSD",
        };
        let gasLimit = 6000000n;
        try {
            gasLimit = BigInt(
                await contracts.signers[
                    contractName[selectedCoin.name]
                ].estimateGas.claimAllBridgedAmounts({
                    value: (await getBridgeClaimGasCost()).toString(),
                })
            );
            // console.log("gasLimit", gasLimit);
            if (gasLimit) {
                return 6000000n;
            }
        } catch (e) {
            return (gasLimit * 12n) / 10n;
        }
    };

    const getGasPrice = async () => {
        const gasPrice = await getNetworkFee(selectedNetwork.id);
        const gasLimit = await getGasEstimate();
        const rate = await getNetworkPrice(networkId);

        setGasPrice(gasPrice);

        setNetworkFeePrice((rate * gasPrice * gasLimit) / 10n ** 9n);
    };

    const getBridgeClaimGasCost = async () => {
        let cost = await contracts.SystemSettings.bridgeClaimGasCost();
        // console.log("bridge claim gas cost", cost);
        return cost;
    };

    const confirm = async () => {
        if (!isValidation) {
            NotificationManager.warning(validationMessage);
            return;
        }
        setIsPending(true);

        const contractName = {
            PERI: "PeriFinance",
            pUSD: "pUSD",
        };
        const transactionSettings = {
            gasPrice: ((await getNetworkFee(selectedNetwork.id)) * 10n ** 9n).toString(),
            gasLimit: (await getGasEstimate()).toString(),
            value: (await getBridgeClaimGasCost()).toString(),
        };

        console.log(
            contractName[selectedCoin.name],
            networkId,
            selectedNetwork,
            transactionSettings
        );

        try {
            let transaction;
            transaction = await contracts.signers[
                contractName[selectedCoin.name]
            ].claimAllBridgedAmounts(transactionSettings);
            dispatch(
                updateTransaction({
                    hash: transaction.hash,
                    message: `Finishing ${selectedCoin.name} cross-chain transfer...`,
                    type: "Cross-Chain Claim",
                    action: () => {
                        getInboundings();
                        setIsPending(false);
                    },
                    error: () => {
                        setIsPending(false);
                    }
                })
            );
        } catch (e) {
            console.error(e);
            setIsPending(false);
        }
    };

    const switchChain = async (chainId) => {
        if (chainId === networkId) {
            return;
        }

        dispatch(setLoading({ name: "balance", value: true }));
        await changeNetwork(chainId);
        dispatch(setLoading({ name: "balance", value: false }));
    };

    /*   useEffect(() => {
        if (!isConnect || !selectedNetwork.id) { return; }

        if (selectedNetwork.id !== networkId) {
            console.log("switchChain", selectedNetwork.id);
            switchChain(selectedNetwork.id);
        }
    }, [selectedNetwork, networkId, isConnect]); */

    useEffect(() => {
        let chainId = networkId;
        if (isNaN(chainId) || chainId === null) {
            chainId = Number(process.env.REACT_APP_DEFAULT_NETWORK_ID);
        } else {
            setSelectedNetwork({ name: SUPPORTED_NETWORKS[chainId], id: chainId });
        }

        initNetworks(chainId);
        setSelectedCoin({ id: 0, name: "pUSD" });
        const network = Object.keys(MAINNET).includes(chainId.toString()) ? MAINNET : TESTNET;
        let returnValue = Object.keys(network).reduce((a, b) => ((a[b] = 0n), a), {});
        setReceiveDatas(returnValue);
    }, []);

    useEffect(() => {
        validationCheck();
    }, [isConnect, selectedNetwork, selectedCoin, networkId, totalAmount]);

    useEffect(() => {
        let setIntervals;
        if (selectedNetwork?.id === networkId && selectedCoin?.name && isConnect) {
            getInboundings();
            setIntervals = setInterval(() => {
                getInboundings();
            }, 1000 * 60);
        }

        if (!isConnect) {
            clearInterval(setIntervals);
        }

        return () => {
            clearInterval(setIntervals);
        };
    }, [isConnect, selectedNetwork, selectedCoin, networkId]);

    useEffect(() => {
        let timeout;
        if (selectedNetwork?.id && !isNaN(networkId) && isConnect) {
            console.log("getGasPrice", networkId, selectedNetwork.id);

            timeout = setTimeout(() => {
                if (totalAmount === 0n) {
                    getGasPrice();
                }
            }, 1000);
        }
        return () => {
            clearTimeout(timeout);
        };
    }, [totalAmount, selectedNetwork, networkId, isConnect]);

    // click on outside close
    const toRef = useRef<HTMLDivElement>(null);
    const coinListRef = useRef<HTMLDivElement>(null);

    const closeModalHandler = useCallback(
        (e) => {
            if (
                isNetworkList &&
                e.target.id !== "net_caller" &&
                !toRef.current.contains(e.target)
            ) {
                setIsNetworkList(false);
            }

            if (
                isCoinList &&
                e.target.id !== "coin_caller" &&
                !coinListRef.current.contains(e.target)
            ) {
                setIsCoinList(false);
            }
        },
        [isNetworkList, isCoinList]
    );

    useEffect(() => {
        window.addEventListener("click", closeModalHandler);

        return () => {
            window.removeEventListener("click", closeModalHandler);
        };
    }, [closeModalHandler]);

    return (
        <div className="flex flex-col bg-gray-700 p-4 overflow-hidden scrollbar-hide">
            <div className="w-full">
                <div className="flex py-1 text-xs">
                    <span className="mx-1 capitalize">Arriving chain</span>
                </div>
            </div>
            <div className="w-full">
                <div className="flex flex-col lg:flex-row lg:space-x-4">
                    <div className="py-1 relative w-full">
                        <div
                            id="net_caller"
                            className="flex p-3 font-semibold bg-black-900 rounded-md justify-between cursor-pointer"
                            onClick={() => setIsNetworkList(!isNetworkList)}
                        >
                            <span id="net_caller" className="mx-1">
                                {selectedNetwork?.name}
                            </span>
                            <svg
                                id="net_caller"
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    id="net_caller"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </div>
                        <div
                            className={`absolute w-full bg-gray-700 rounded-md shadow-md shadow-slate-600 my-1 ${
                                isNetworkList ? "block" : "hidden"
                            } z-10`}
                            ref={toRef}
                        >
                            <ul className="list-reset">
                                {networks.map((network, index) => (
                                    <li
                                        key={index}
                                        onClick={() => {
                                            setSelectedNetwork(network);
                                            setIsNetworkList(false);
                                            switchChain(network.id);
                                        }}
                                    >
                                        <p
                                            className={`p-2 block hover:bg-black-900 cursor-pointer ${
                                                selectedNetwork?.name === network?.name &&
                                                "bg-black-900"
                                            }`}
                                        >
                                            {network?.name}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="py-1 relative w-full">
                        <div className="flex justify-between items-center rounded-md bg-black-900">
                            <div className="relative">
                                <div
                                    id="coin_caller"
                                    className="flex p-3 font-semibold cursor-pointer"
                                    onClick={() => setIsCoinList(!isCoinList)}
                                >
                                    <img
                                        id="coin_caller"
                                        alt="selected_coin"
                                        className="w-[22px] h-[22px]"
                                        src={`/images/currencies/${selectedCoin?.name}.svg`}
                                    ></img>
                                    <div id="coin_caller" className="mx-1">
                                        {selectedCoin?.name}
                                    </div>
                                    <svg
                                        id="coin_caller"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            id="coin_caller"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </div>
                                <div
                                    className={`absolute w-full bg-gray-700 rounded-md shadow-md shadow-slate-600 my-1 ${
                                        isCoinList ? "block" : "hidden"
                                    } z-10`}
                                    ref={coinListRef}
                                >
                                    <ul className="list-reset">
                                        {pynths.map((coin) => (
                                            <li
                                                key={coin.id}
                                                onClick={() => {
                                                    setSelectedCoin(coin);
                                                    setIsCoinList(false);
                                                }}
                                            >
                                                <p
                                                    className={`flex space-x-2 p-2 hover:bg-black-900 cursor-pointer ${
                                                        selectedCoin?.name === coin?.name &&
                                                        "bg-black-900"
                                                    }`}
                                                >
                                                    <img
                                                        alt="coin_name"
                                                        className="w-6 h-6"
                                                        src={`/images/currencies/${coin?.name}.svg`}
                                                    ></img>
                                                    {coin?.name}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <input
                                className="bg-black-900 pr-3 outline-none text-right"
                                type="text"
                                value={formatCurrency(totalAmount, 4)}
                                disabled
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div key="from" className="font-medium py-2 mt-5">
                Pending Amount
            </div>
            <div className="flex flex-col mb-5 text-sm overflow-y-scroll rounded-lg text-center bscrollbar-hide">
                <div className="flex flex-row space-x-2 ">
                    {Object.keys(receiveDatas).map((e, idx) => (
                        <div
                            className="font-medium py-4 min-w-36 w-full border border-slate-900/40 rounded-t-lg bg-black-900/30 "
                            key={`rec_net_${idx}`}
                        >
                            {networkInfo[e].chainName}{" "}
                        </div>
                    ))}
                </div>
                <div className="flex flex-row space-x-2">
                    {Object.values(receiveDatas).map((amount, idx) => (
                        <div
                            key={`amount_${idx}`}
                            className={`py-4 min-w-36 w-full border-2 border-black-900/50 rounded-b-lg${
                                amount && "text-red-700"
                            }`}
                        >
                            <span className="text-xs font-medium pl-1">
                                {amount
                                    ? `${amount ? formatCurrency(amount, 4) : 0} ${
                                          selectedCoin?.name
                                      }`
                                    : 0}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-2">
                <div className="flex justify-between w-full lg:justify-center">
                    <span className="mr-3">Network Fee:</span>
                    <div className="flex flex-nowrap items-center">
                        <span className="font-medium">{gasPrice.toString()} GWEI</span>
                        <span className="font-light text-xs tracking-tighter">{` ($${formatCurrency(
                            networkFeePrice,
                            5
                        )}) `}</span>
                    </div>
                </div>
            </div>

            <button
                className="btn-base flex flex-row items-center my-6 py-2 w-full text-xl lg:w-80 lg:mx-auto"
                onClick={() => confirm()}
                disabled={isPending}
            >
                <div className="flex basis-1/3 justify-end pr-2">
                    {isPending && (
                        <svg
                            className="animate-spin h-5 w-5 text-white"
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

            <div className="bg-black-900 w-full text-center break-wards text-cyan-300/70 rounded-lg text-xs font-medium p-2">
                {validationMessage}
            </div>
        </div>
    );
};
export default Receive;
