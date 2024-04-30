/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toWei } from "web3-utils";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "reducers";
import { contracts, formatCurrency } from "lib";
import { SUPPORTED_NETWORKS, MAINNET, TESTNET } from "lib/network";
import { getBalanceNetwork } from "lib/balance";
import { getNetworkFee } from "lib/fee";
import { updateTransaction } from "reducers/transaction";
import { changeNetwork } from "lib/network";
import { getNetworkPrice } from "lib/price";
import { NotificationManager } from "react-notifications";
import { utils } from "ethers";
import pynths from "configure/coins/bridge";
import { setLoading } from "reducers/loading";
import BridgeStatus from "./BridgeStatus";
import { resetBridgeStatus, setOnSendCoin, setObsolete, updateStep } from "reducers/bridge/bridge";
import { fromBigNumber, toBigNumber } from "lib/bigInt";
import { extractMessage } from "lib/error";

const zeroSignature =
    "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

const btnBridgeMsg = {
    0: "Submit",
    1: "Processing",
    2: "Receive",
    3: "Processing",
};

const Submit = () => {
    const { cost, step, pendingCoins } = useSelector((state: RootState) => state.bridge);
    const { address, networkId, isConnect } = useSelector((state: RootState) => state.wallet);
    const { lastRateData } = useSelector((state: RootState) => state.exchangeRates);
    // const { isReady } = useSelector((state: RootState) => state.app);
    const [payAmount, setPayAmount] = useState("0");
    const [per, setPer] = useState(0n);
    const [networks, setNetworks] = useState([]);
    const [selectedFromNetwork, setSelectedFromNetwork] = useState<{
        name?: string;
        id?: Number;
        balance?: { pUSD: bigint; PERI: bigint };
    }>(undefined);
    const [selectedToNetwork, setSelectedToNetwork] = useState<{
        name?: string;
        id?: Number;
        balance?: { pUSD: bigint; PERI: bigint };
    }>({});
    const [isFromNetworkList, setIsFromNetworkList] = useState(false);
    const [isToNetworkList, setIsToNetworkList] = useState(false);
    const [isCoinList, setIsCoinList] = useState(false);
    const [selectedCoin, setSelectedCoin] = useState<{
        name?: string;
        id?: Number;
        contract?: string;
    }>({});
    const [initBridge, setInitBridge] = useState(false);
    const [networkFeePrice, setNetworkFeePrice] = useState(0n);
    const [gasPrice, setGasPrice] = useState("0");
    // const [signature, setSignature] = useState(zeroSignature);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isValidation, setIsValidation] = useState(false);
    const [validationMessage, setValidationMessage] = useState("");
    const dispatch = useDispatch();

    const validationCheck = () => {
        // console.log("validationCheck", Number(step));
        setIsValidation(false);
        if (!isConnect) {
            setValidationMessage("Please connect your wallet");
        } else if (Number(step) === 0) {
            if (selectedFromNetwork && networkId !== selectedFromNetwork?.id) {
                setValidationMessage("Please enter numbers only!");
            } else if (selectedToNetwork?.id === undefined || selectedToNetwork?.id === 0) {
                setValidationMessage("Please select destination network");
            } else if (payAmount === "" || payAmount === "0") {
                setValidationMessage("Please enter the amount you want to bridge");
            } else {
                setValidationMessage("Try to bridge PERI or pUSD to other networks");
                setIsValidation(true);
            }
        } else if (Number(step) === 2) {
            const currentAsset = pendingCoins.filter((item) => item.coin === selectedCoin.name)[0];
            // console.log("validationCheck", currentAsset, selectedCoin);
            if (!currentAsset || currentAsset.pendings.length === 0) {
                setValidationMessage("Please change the token you want to proceed");
            } else {
                setValidationMessage("Please receive your bridged asset");
                setIsValidation(true);
            }
        } else {
            setValidationMessage("Please wait for the bridge to complete");
        }
    };

    const onSelectSouceChain = async (network) => {
        setIsFromNetworkList(false);

        if (network.id === selectedFromNetwork.id) {
            return;
        }

        // setSelectedFromNetwork(network);
        setSelectedToNetwork({});
        if (network?.name === "KOVAN")
            setSelectedCoin({
                name: "PERI",
                id: 1,
                contract: "PeriFinance",
            });

        switchChain(network.id);
    };

    const getBalance = () => {
        if (selectedFromNetwork) {
            return networks.find((e) => selectedFromNetwork.id === e.id)?.balance[selectedCoin?.name];
        }
        return 0n;
    };

    const setPerAmount = (per) => {
        setPer(per);
        const balance = getBalance();
        const convertPer = per > 0n ? (100n * 10n) / per : 0n;
        const perBalance = convertPer > 0n ? (balance * 10n) / convertPer : 0n;
        setPayAmount(fromBigNumber(perBalance));
    };

    const switchChain = async (chainId) => {
        // console.log("switchChain", chainId);

        if (!chainId) {
            return;
        }
        try {
            dispatch(setLoading({ name: "balance", value: true }));
            await changeNetwork(chainId);
            dispatch(resetBridgeStatus(networkId));
            dispatch(setLoading({ name: "balance", value: false }));
        } catch (error) {
            console.log(error);
        }
    };

    const getGasLimit = async () => {
        return step === 0 ? 610000n : 300000n;
        /* let gasLimit = 600000n;

        console.log("cost", cost, "step", step);
        (cost === null || cost === "0") && (cost = toWei(`8867349.3`, 'gwei'));

        const amount = (payAmount === null || payAmount === "0") ? "1" : payAmount;
        const chainId = selectedToNetwork?.id ? selectedToNetwork.id : 1;

        try {
            let tmpGasLimit;
            if (Number(step) === 2) {
                tmpGasLimit = await contracts.signers[selectedCoin.contract].estimateGas.claimAllBridgedAmounts({
                    value: cost,
                });
            } else if (Number(step) === 0) {
                const rsv = utils.splitSignature(signature);

                const bnAmt = toBigNumber(amount).toBigInt();
                console.log("gasLimit", tmpGasLimit, bnAmt);
                tmpGasLimit = await contracts.signers[selectedCoin.contract].estimateGas.overchainTransfer(
                    toBigNumber(amount),
                    chainId,
                    [rsv.r, rsv.s, rsv.v],
                    {   
                        gasLimit: 600000n,
                    }
                );
            }

            console.log("gasLimit", tmpGasLimit);
            if (!gasLimit) {
                return 6000000n;
            }

            gasLimit = BigInt(tmpGasLimit);
        } catch (e) {
            console.log(e);
        }
        return (gasLimit * 12n) / 10n; */
    };

    const getGasPrice = useCallback( async () => {
        if (step !== 0 && step !== 2) {
            return;
        }

        const key = step.toString();
        try {
            const [gasPrice, gasLimit, rate] = await Promise.all([
                getNetworkFee(networkId),
                getGasLimit(),
                getNetworkPrice(networkId),
            ]);

            console.log("gasPrice", BigInt(toWei(gasPrice, "gwei")), "gasLimit", gasLimit, "rate", rate, "cost", BigInt(cost[key]));
            setGasPrice(gasPrice);
            setNetworkFeePrice((rate * (BigInt(toWei(gasPrice, "gwei")) * gasLimit + BigInt(cost[key]))) / 10n ** 18n);
        } catch (error) {
            console.log(error);
        }
    }, [cost, networkId]);

    const bridgeSubmit = async () => {
        if (!isValidation) {
            NotificationManager.warning(validationMessage);
            return;
        }

        if (contracts.signers[selectedCoin.contract] === undefined) {
            // console.log("selectedCoin.contract", selectedCoin.contract);
            NotificationManager.warning("Please refresh it and try it again.");
            return;
        }

        setIsProcessing(true);
        // await getGasPrice();
        dispatch(updateStep(1));

        const messageHash = utils.solidityKeccak256(
            ["bytes"],
            [utils.solidityPack(["uint"], [toBigNumber(payAmount)])]
        );

        try {
            const messageHashBytes = utils.arrayify(messageHash);
            const mySignature = await contracts.signer.signMessage(messageHashBytes);

            if (mySignature === zeroSignature) {
                NotificationManager.warning("Signature is not valid. Please refresh it and try it again.");
                return;
            }

            const transferCost = cost[step.toString()];

            if (transferCost === null || transferCost === undefined) {
                NotificationManager.warning("Please refresh it and try it again.");
                setIsProcessing(false);
                return;
            }

            // let mySignature = await contracts.signer.signMessage(messageHashBytes);
            // setSignature(mySignature);

            // console.log("mySignature", mySignature);
            // const cost = (await getBridgeTransferGasCost()).toString();

            const [gasPrice, gasLimit] = await Promise.all([
                getNetworkFee(networkId),
                getGasLimit(),
            ]);

            const transactionSettings = {
                gasPrice: toWei(gasPrice, "gwei").toString(),
                gasLimit: gasLimit.toString(),
                value: transferCost
            };

            let transaction;
            let rsv = utils.splitSignature(mySignature);

            transaction = await contracts.signers[selectedCoin.contract].overchainTransfer(
                toBigNumber(payAmount),
                selectedToNetwork.id,
                [rsv.r, rsv.s, rsv.v],
                transactionSettings
            );
            dispatch(
                updateTransaction({
                    hash: transaction.hash,
                    message: `Bridging ${payAmount} ${selectedCoin.name} to ${selectedToNetwork.name}...`,
                    type: `Cross-Chain Bridge`,
                    action: () => {
                        setPayAmount("0");
                        dispatch(
                            setOnSendCoin({
                                destChainId: selectedToNetwork.id,
                                srcChainId: networkId,
                                coin: selectedCoin.name,
                            })
                        );
                        changeNetwork(selectedToNetwork.id);
                        initBalances();
                    },
                    error: () => {
                        dispatch(updateStep(0));
                        setIsProcessing(false);
                        // NotificationManager.warning("Transaction failed. Please refresh it and try it again.");
                    },
                })
            );

            // dispatch(setLoading({ name: "balance", value: false }));
        } catch (e) {
            console.log(e);
            dispatch(updateStep(0));
            setIsProcessing(false);

            NotificationManager.warning(extractMessage(e));
        }
    };

    const bridgeReceive = async () => {
        if (!isValidation) {
            NotificationManager.warning(validationMessage);
            return;
        }

        if (contracts.signers[selectedCoin.contract] === undefined) {
            NotificationManager.warning("Please refresh it and try it again.");
            return;
        }

        setIsProcessing(true);
        // await getGasPrice();
        dispatch(updateStep(3));

        try {
            const claimCost = cost[step.toString()];
            if (claimCost === null || claimCost === undefined) {
                NotificationManager.warning("Please refresh it and try it again.");
                setIsProcessing(false);
                return;
            }

            const transactionSettings = {
                gasPrice: toWei(await getNetworkFee(networkId), "gwei"),
                gasLimit: (await getGasLimit()).toString(),
                value: claimCost,
            };

            console.log(selectedCoin.contract, networkId, transactionSettings);

            let transaction;
            transaction = await contracts.signers[selectedCoin.contract].claimAllBridgedAmounts(transactionSettings);
            dispatch(
                updateTransaction({
                    hash: transaction.hash,
                    message: `Finishing ${selectedCoin.name} cross-chain transfer...`,
                    type: "Cross-Chain Claim",
                    action: () => {
                        dispatch(setOnSendCoin({ destChainId: networkId, srcChainId: 0, coin: selectedCoin.name }));
                        dispatch(resetBridgeStatus(networkId));
                        dispatch(setObsolete(true));
                        initBalances();
                        setIsProcessing(false);
                    },
                    error: () => {
                        dispatch(updateStep(2));
                        setIsProcessing(false);
                        // NotificationManager.warning("Transaction failed. Please refresh it and try it again.");
                    },
                })
            );
        } catch (e) {
            console.error(e);
            NotificationManager.warning(extractMessage(e));
            dispatch(updateStep(2));
            setIsProcessing(false);
        }
    };

    const onExecute = async () => {
        // for test only
        /*************************************************/
        // const costSubmit = await getBridgeTransferGasCost()
        // const costClaim = await getBridgeClaimGasCost()

        // console.log("cost", costSubmit, costClaim);

        // const gasLimit = await getGasEstimate(costSubmit);
        // console.log("gasLimit", gasLimit);
        /*************************************************/
        // return;

        if (Number(step) === 0) {
            bridgeSubmit();
        } else if (step === 2) {
            bridgeReceive();
        } else {
            NotificationManager.warning("Please wait for the bridge to complete");
        }
    };

    const networkSwap = () => {
        const fromNetwork = selectedFromNetwork && Object.assign({}, selectedFromNetwork);
        const toNetwork = selectedToNetwork && Object.assign({}, selectedToNetwork);
        if (toNetwork || fromNetwork) {
            setSelectedFromNetwork(toNetwork);
            setSelectedToNetwork(fromNetwork);
        }
    };

    const initBalances = useCallback(async () => {
        try {
            // console.log("networks", networks);
            const [pUSDBalances, PERIbalances] = await Promise.all([
                getBalanceNetwork(selectedFromNetwork, address, "ProxyERC20pUSD"),
                getBalanceNetwork(selectedFromNetwork, address, "ProxyERC20"),
            ]);

            const idx = networks.findIndex((e) => e.id === selectedFromNetwork.id);
            const networksAddBalances = [...networks];
            networksAddBalances[idx].balance = {
                pUSD: BigInt(pUSDBalances),
                PERI: BigInt(PERIbalances),
            };

            console.log(networksAddBalances);
            setNetworks(networksAddBalances);
        } catch (error) {
            console.log(error);
        }
    }, [selectedFromNetwork, address /* setNetworks, getBalanceNetwork */]);

    // When source chain changed
    /*     useEffect(() => {
        if (isNaN(networkId) || !selectedFromNetwork?.id) { return; }

        let loader = true;
        if (isConnect && networkId !== selectedFromNetwork.id && loader) {
            switchChain(selectedFromNetwork.id);
        }

        return () => {
            loader = false;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFromNetwork, networkId, isConnect]); */

    const initNetworks = () => {
        let chainId = networkId;
        if (isNaN(chainId) || chainId == null) {
            chainId = Number(process.env.REACT_APP_DEFAULT_NETWORK_ID);
        }

        setSelectedFromNetwork({ id: networkId, name: SUPPORTED_NETWORKS[networkId] });
        setSelectedToNetwork({});

        const network = Object.keys(MAINNET).includes(chainId.toString()) ? MAINNET : TESTNET;
        let networks = Object.keys(SUPPORTED_NETWORKS)
            .filter((e) => Object.keys(network).includes(e))
            .map((e) => {
                return {
                    name: SUPPORTED_NETWORKS[e],
                    id: Number(e),
                    balance: {
                        pUSD: BigInt(0),
                        PERI: BigInt(0),
                    },
                };
            });

        setNetworks(networks);

        return networks;
    };

    useEffect(() => {
        setSelectedFromNetwork({ id: networkId, name: SUPPORTED_NETWORKS[networkId] });
    }, [networkId]);

    useEffect(() => {
        validationCheck();
    }, [step, isConnect, initBridge, selectedFromNetwork, selectedToNetwork, selectedCoin, payAmount]);

    useEffect(() => {
        if (isConnect && initBridge && address) {
            if ([1, 5, 11155111].includes(networkId)) setSelectedCoin(pynths[1]);
            else setSelectedCoin(pynths[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnect, initBridge, address]);

    // ** Init supported networks and default token
    // 1. Only called at the mounting
    useEffect(() => {
        initNetworks();
        setInitBridge(true);
    }, []);

    useEffect(() => {
        if (selectedFromNetwork?.id) {
            initBalances();
        }
    }, [initBalances]);

    useEffect(() => {
        // console.log("cost", Object.values(cost).map(BigInt));
        Object.keys(cost).length && getGasPrice();
    }, [getGasPrice, lastRateData]);

    useEffect(() => {
        setPayAmount("");
        setGasPrice("0");
        setNetworkFeePrice(0n);

    }, [selectedCoin, networkId, address]);

    // *** DropBox list handlers
    // ****************************************************************************************************
    const fromRef = useRef<HTMLDivElement>(null);
    const toRef = useRef<HTMLDivElement>(null);
    const availableRef = useRef<HTMLDivElement>(null);

    const closeModalHandler = useCallback(
        (e) => {
            if (isFromNetworkList && e.target.id !== "from_caller" && !fromRef.current.contains(e.target)) {
                setIsFromNetworkList(false);
            }

            if (isToNetworkList && e.target.id !== "to_caller" && !toRef.current.contains(e.target)) {
                setIsToNetworkList(false);
            }

            if (isCoinList && e.target.id !== "coin_caller" && !availableRef.current.contains(e.target)) {
                setIsCoinList(false);
            }
        },
        [isCoinList, isFromNetworkList, isToNetworkList]
    );

    useEffect(() => {
        window.addEventListener("click", closeModalHandler);

        return () => {
            window.removeEventListener("click", closeModalHandler);
        };
    }, [closeModalHandler]);

    return (
        <div className="flex flex-col bg-blue-900 px-3 lg:px-4 py-2">
            <div className="flex flex-col lg:flex-row  lg:space-x-3 z-5">
                <div className="basis-2/5 flex flex-col items-start w-full">
                    <div className="w-full">
                        <div className="text-xs pl-1">Source</div>
                        <div className="py-1 relative">
                            <div
                                id="from_caller"
                                className="flex p-3 font-semibold bg-blue-950 rounded-md justify-between cursor-pointer"
                                onClick={() => setIsFromNetworkList(!isFromNetworkList)}
                            >
                                <span id="from_caller" className="mx-1">
                                    {selectedFromNetwork?.name}
                                </span>
                                <svg
                                    id="from_caller"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        id="from_caller"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                            <div
                                className={`absolute w-full bg-blue-900 rounded-md shadow-md shadow-slate-600 my-1 ${
                                    isFromNetworkList ? "block" : "hidden"
                                } z-10`}
                                ref={fromRef}
                            >
                                <ul className="list-reset">
                                    {networks.map((network, index) => (
                                        <li key={index} onClick={() => onSelectSouceChain(network)}>
                                            <p
                                                className={`p-2 block hover:bg-blue-950 cursor-pointer ${
                                                    selectedFromNetwork?.name === network?.name && "bg-blue-950"
                                                }`}
                                            >
                                                {network?.name}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div
                        className="flex self-center items-center mx-auto -mb-4 w-9 h-9 bg-blue-950 rounded-full cursor-pointer"
                        onClick={() => networkSwap()}
                    >
                        <div className="transform-gpu m-auto">
                            <img className="w-4 h-5 align-middle" src={"/images/icon/exchange.png"} alt="netswap" />
                        </div>
                    </div>

                    <div className="w-full">
                        <div className="text-xs">Destination</div>

                        <div className="py-1 relative">
                            <div
                                id="to_caller"
                                className="flex p-3 font-semibold bg-blue-950 rounded-md justify-between cursor-pointer"
                                onClick={() => setIsToNetworkList(!isToNetworkList)}
                            >
                                <span id="to_caller" className="mx-1">
                                    {selectedToNetwork?.name}
                                </span>
                                <svg
                                    id="to_caller"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        id="to_caller"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                            <div
                                className={`absolute w-full bg-blue-900 rounded-md shadow-md shadow-slate-600  my-1 ${
                                    isToNetworkList ? "block" : "hidden"
                                }  z-50`}
                                ref={toRef}
                            >
                                <ul className="list-reset">
                                    {networks
                                        .filter((e) => {
                                            return (
                                                selectedFromNetwork?.id !== e.id &&
                                                !(selectedCoin?.name === "pUSD" && (e.id === 11155111 || e.id === 1))
                                            );
                                        })
                                        .map((network, index) => (
                                            <li
                                                key={index}
                                                onClick={() => {
                                                    setSelectedToNetwork(network);
                                                    setIsToNetworkList(false);
                                                }}
                                            >
                                                <p
                                                    className={`p-2 block hover:bg-blue-950 cursor-pointer ${
                                                        selectedToNetwork?.name === network?.name && "bg-blue-950"
                                                    }`}
                                                >
                                                    {network?.name}
                                                </p>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex basis-3/5 flex-col w-full">
                    <div className="flex pb-1 ml-1 justify-between w-full text-xs">
                        <span>{`Available `}</span>
                        <span className="mx-1 font-medium">{` ${formatCurrency(getBalance(), 4)}`}</span>
                    </div>
                    <div className="flex flex-col w-full">
                        <div className="flex lg:rounded-md bg-blue-950 justify-between w-full">
                            <div className="py-1 relative font-semibold z-1">
                                <div
                                    id="coin_caller"
                                    className="flex p-2 cursor-pointer items-center"
                                    onClick={() => setIsCoinList(!isCoinList)}
                                >
                                    <img
                                        id="coin_caller"
                                        alt="currency"
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
                                    className={`absolute w-full bg-blue-900 rounded-md shadow-md shadow-slate-600  my-2 ${
                                        isCoinList ? "block" : "hidden"
                                    } z-99`}
                                    ref={availableRef}
                                >
                                    <ul className="list-reset">
                                        {pynths.map((coin) => {
                                            if ((networkId === 1 || networkId === 5) && coin.name === "pUSD")
                                                return null;
                                            else
                                                return (
                                                    <li
                                                        key={coin.id}
                                                        onClick={() => {
                                                            setSelectedCoin(coin);
                                                            setIsCoinList(false);
                                                            dispatch(resetBridgeStatus(networkId));
                                                        }}
                                                    >
                                                        <p
                                                            className={`flex space-x-2 p-2 hover:bg-blue-950 cursor-pointer ${
                                                                selectedCoin?.name === coin?.name && "bg-blue-950"
                                                            }`}
                                                        >
                                                            <img
                                                                className="w-6 h-6"
                                                                src={`/images/currencies/${coin?.name}.svg`}
                                                                alt="currency"
                                                            ></img>
                                                            {coin?.name}
                                                        </p>
                                                    </li>
                                                );
                                        })}
                                    </ul>
                                </div>
                            </div>

                            <input
                                className="w-2/3 bg-blue-950 outline-none text-right font-medium rounded-lg px-2 text-base"
                                type="text"
                                value={payAmount}
                                onChange={(e) => setPayAmount(e.target.value)}
                                onFocus={(e) => e.target.select()}
                            />
                        </div>
                        <div className="flex items-center my-3 lg:mt-8">
                            <div className="flex flex-col pt-3 w-full">
                                <div className="flex justify-between ">
                                    <input
                                        className="cursor-pointer w-full mr-1"
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={per.toString()}
                                        onChange={(e) => setPerAmount(BigInt(e.target.value))}
                                    />
                                </div>
                                <div className="flex flex-row justify-between text-xs w-full">
                                    <span
                                        className={`base-1/5 last:text-left cursor-pointer ${
                                            per === 0n && "text-blue-600"
                                        }`}
                                        onClick={() => setPerAmount(0n)}
                                    >
                                        0%
                                    </span>
                                    <span
                                        className={`base-1/5 text-center cursor-pointer ${
                                            per === 25n && "text-blue-600"
                                        }`}
                                        onClick={() => setPerAmount(20n)}
                                    >
                                        20%
                                    </span>
                                    <span
                                        className={`base-1/5 text-center cursor-pointer ${
                                            per === 25n && "text-blue-600"
                                        }`}
                                        onClick={() => setPerAmount(40n)}
                                    >
                                        40%
                                    </span>
                                    <span
                                        className={`base-1/5 text-center cursor-pointer ${
                                            per === 50n && "text-blue-600"
                                        }`}
                                        onClick={() => setPerAmount(60n)}
                                    >
                                        60%
                                    </span>
                                    <span
                                        className={`base-1/5 text-center cursor-pointer ${
                                            per === 75n && "text-blue-600"
                                        }`}
                                        onClick={() => setPerAmount(80n)}
                                    >
                                        80%
                                    </span>
                                    <span
                                        className={`base-1/5 text-right cursor-pointer ${
                                            per === 100n && "text-blue-600"
                                        }`}
                                        onClick={() => setPerAmount(100n)}
                                    >
                                        100%
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center self-end h-8 border border-blue-200/50 rounded-md text-sm ml-1 px-1 bg-blue-950">
                                <input
                                    className="w-6 bg-blue-950 outline-none"
                                    type="number"
                                    max="100"
                                    value={per.toString()}
                                    onChange={(e) =>
                                        setPerAmount(
                                            Number(e.target.value) > 100 ? BigInt("100") : BigInt(e.target.value)
                                        )
                                    }
                                />
                                %
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col-reverse items-center lg:flex-row justify-between lg:space-x-2 xl:space-x-4">
                <div className="flex flex-col justify-start w-full basis-2/5 my-6">
                    {/* <div className="mt-0"> */}
                    <div className="flex justify-between w-full lg:justify-center mt-1 text-[11px]">
                        <span className="font-medium mr-3">Network Fee:</span>
                        <div className="flex flex-nowrap items-center">
                            <span className="font-medium">{Number(gasPrice).toFixed(2)} GWEI</span>
                            <span className="font-light tracking-tighter">{` ($${formatCurrency(
                                networkFeePrice,
                                5
                            )}) `}</span>
                        </div>
                    </div>
                    {/* </div> */}

                    <button
                        className="btn-base flex flex-row items-center my-4 py-2 w-full text-inherent lg:w-48 lg:mx-auto"
                        onClick={() => onExecute()}
                        disabled={isProcessing}
                    >
                        <div className="flex basis-1/3 justify-end pr-2">
                            {isProcessing && (
                                <svg
                                    className="animate-spin h-5 w-5 text-blue-500"
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
                        <span className="basis-1/3 text-lg">{btnBridgeMsg[step as number]}</span>
                    </button>
                </div>
                <div className="flex w-full lg:basis-3/5">
                    <BridgeStatus selectedCoin={selectedCoin.name} setIsProcessing={setIsProcessing} />
                </div>
            </div>
            <div className="bg-blue-950 w-full text-center break-wards text-cyan-300/70 rounded-lg text-xs font-medium p-2">
                {validationMessage}
            </div>

            <div className="w-auto text-gray-300 items-center p-2">
                <span className="text-lg font-bold pb-4">Notice</span>
                <p className="leading-tight">
                    It may take up to 10 minutes before the step 2 is processed. Please be patient.
                </p>
            </div>
        </div>
    );
};
export default Submit;
