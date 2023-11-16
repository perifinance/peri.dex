/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "reducers";
import { contracts, formatCurrency } from "lib";
import { SUPPORTED_NETWORKS, MAINNET, TESTNET } from "lib/network";
import { getBalancesNetworks } from "lib/balance";
import { getNetworkFee } from "lib/fee";
import { updateTransaction } from "reducers/transaction";
import { changeNetwork } from "lib/network";
import { getNetworkPrice } from "lib/price";
import { NotificationManager } from "react-notifications";
import { /* ethers, providers, */ utils } from "ethers";
import pynths from "configure/coins/bridge";
import { setLoading } from "reducers/loading";
import { is } from "date-fns/locale";
import { on } from "events";
// import init from "@web3-onboard/core";
// import { set } from "date-fns";
// import { wallet } from 'reducers/wallet';

const zeroSignature =
    "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

const Submit = () => {
    const { isReady } = useSelector((state: RootState) => state.app);
    const { address, networkId, isConnect } = useSelector((state: RootState) => state.wallet);
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
    const [gasPrice, setGasPrice] = useState(0n);
    const [signature, setSignature] = useState(zeroSignature);
    const [isPending, setIsPending] = useState(false);
    const [isValidation, setIsValidation] = useState(false);
    const [validationMessage, setValidationMessage] = useState("");
    const dispatch = useDispatch();

    const validationCheck = () => {
        setIsValidation(false);
        if (!isConnect) {
            setValidationMessage("Please connect your wallet");
        } else if (selectedFromNetwork && networkId !== selectedFromNetwork?.id) {
            setValidationMessage("Please enter numbers only!");
        } else if (selectedToNetwork?.id === undefined || selectedToNetwork?.id === 0) {
            setValidationMessage("Please select destination network");
        } else if (payAmount === "" || payAmount === "0") {
            setValidationMessage("Please enter the amount you want to bridge");
        } else {
            setValidationMessage("Try to bridge PERI or pUSD to other networks");
            setIsValidation(true);
        }
    };

    const onSelectSouceChain = async (network) => {
        setIsFromNetworkList(false);

        if (network.id === selectedFromNetwork.id) {
            return;
        }

        setSelectedFromNetwork(network);
        setSelectedToNetwork({});
        if (network?.name === "KOVAN")
            setSelectedCoin({
                name: "PERI",
                id: 1,
                contract: "periFinance",
            });

        switchChain(network.id);
    };

    const getBalance = () => {
        if (selectedFromNetwork) {
            return networks.find((e) => selectedFromNetwork.id === e.id)?.balance[
                selectedCoin?.name
            ];
        }
        return 0n;
    };

    const setPerAmount = (per) => {
        setPer(per);
        const balance = getBalance();
        const convertPer = per > 0n ? (100n * 10n) / per : 0n;
        const perBalance = convertPer > 0n ? (balance * 10n) / convertPer : 0n;
        setPayAmount(utils.formatEther(perBalance));
    };

    const switchChain = async (chainId) => {
        console.log("switchChain", chainId);

        if (!chainId) {
            return;
        }

        dispatch(setLoading({ name: "balance", value: true }));

        await changeNetwork(chainId);
        dispatch(setLoading({ name: "balance", value: false }));
    };

    const getBridgeTransferGasCost = async () => {
        return await contracts.SystemSettings?.bridgeTransferGasCost();
    };

    const getGasEstimate = async () => {
        let gasLimit = 600000n;
        const contractName = {
            PERI: "PeriFinance",
            pUSD: "pUSD",
        };
        try {
            let rsv = utils.splitSignature(signature);
            let cost = (await getBridgeTransferGasCost())?.toString();
            // let limit = (await contracts.signers[contractName[selectedCoin.name]].estimateGas.overchainTransfer(utils.parseEther(payAmount), selectedToNetwork.id, [rsv.r, rsv.s, rsv.v], {value: cost}));
            // console.log(limit);
            // gasLimit = BigInt(limit);
        } catch (e) {
            console.log(e);
        }
        return (gasLimit * 12n) / 10n;
    };

    const getGasPrice = async () => {
        const gasPrice = await getNetworkFee(selectedFromNetwork.id);
        const gasLimit = await getGasEstimate();
        const rate = await getNetworkPrice(networkId);

        setGasPrice(gasPrice);
        setNetworkFeePrice((rate * gasPrice * gasLimit) / 10n ** 9n);
    };

    const bridgeConfirm = async () => {
        // dispatch(setLoading({ name: "balance", value: true }));

        if (!isValidation) {
            NotificationManager.warning(validationMessage);
            return;
        }
        setIsPending(true);

        const contractName = {
            PERI: "PeriFinance",
            pUSD: "pUSD",
        };

        const messageHash = utils.solidityKeccak256(
            ["bytes"],
            [utils.solidityPack(["uint"], [utils.parseEther(payAmount)])]
        );

        try {
            const messageHashBytes = utils.arrayify(messageHash);
            let mySignature = await contracts.signer.signMessage(messageHashBytes);
            setSignature(mySignature);

            console.log("mySignature", mySignature);
            const transactionSettings = {
                gasPrice: ((await getNetworkFee(selectedFromNetwork.id)) * 10n ** 9n).toString(),
                gasLimit: (await getGasEstimate()).toString(),
                value: (await getBridgeTransferGasCost()).toString(),
            };
            if (mySignature === zeroSignature) throw Error("Bridge need signature");

            let transaction;
            let rsv = utils.splitSignature(mySignature);

            console.log(
                "contractName[selectedCoin.name]",
                contractName[selectedCoin.name],
                contracts.signers[contractName[selectedCoin.name]]
            );

            transaction = await contracts.signers[
                contractName[selectedCoin.name]
            ].overchainTransfer(
                utils.parseEther(payAmount),
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
                        initBalances();
                        setPayAmount("0");
                        setIsPending(false);
                    },
                })
            );

            // dispatch(setLoading({ name: "balance", value: false }));
        } catch (e) {
            console.log(e);
            setIsPending(false);
        }
        // dispatch(setLoading({ name: "balance", value: false }));
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
            const pUSDBalances = await getBalancesNetworks(networks, address, "ProxyERC20pUSD");
            const PERIbalances = await getBalancesNetworks(networks, address, "ProxyERC20");
            const networksAddBalances = networks.map((e, i) => {
                return {
                    ...e,
                    balance: {
                        pUSD: BigInt(pUSDBalances[i]),
                        PERI: BigInt(PERIbalances[i]),
                    },
                };
            });
            setNetworks(networksAddBalances);
        } catch (error) {
            console.log(error);
        }
    }, [networks, address, setNetworks, getBalancesNetworks]);

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
        } else {
            setSelectedFromNetwork({ id: networkId, name: SUPPORTED_NETWORKS[networkId] });
            setSelectedToNetwork({});
        }

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
        validationCheck();
    }, [isConnect, initBridge, selectedFromNetwork, selectedToNetwork, selectedCoin, payAmount]);

    useEffect(() => {
        if (isConnect && initBridge && address) {
            if (networkId === 1 || networkId === 5) setSelectedCoin(pynths[1]);
            else setSelectedCoin(pynths[0]);
            initBalances();
        } else {
            isConnect && initNetworks();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnect, initBridge, address]);

    // ** Init supported networks and default token
    // 1. Only called at the mounting
    useEffect(() => {
        initNetworks();

        if (networkId === 1 || networkId === 5) setSelectedCoin(pynths[1]);
        else setSelectedCoin(pynths[0]);

        setInitBridge(true);
    }, []);

    // ** Get Gas price
    // 1. payAmount change
    // 2. source network change
    // 3. networkId change
    // 4. wallet connect
    /***********************/
    useEffect(() => {
        let timeout;
        if (selectedFromNetwork?.id && !isNaN(networkId) && isConnect) {
            timeout = setTimeout(() => {
                if (payAmount !== "") {
                    getGasPrice();
                }
            }, 1000);
        }
        return () => {
            clearTimeout(timeout);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFromNetwork, networkId, isConnect]);

    // *** DropBox list handlers
    // ****************************************************************************************************
    const fromRef = useRef<HTMLDivElement>(null);
    const toRef = useRef<HTMLDivElement>(null);
    const availableRef = useRef<HTMLDivElement>(null);

    const closeModalHandler = useCallback(
        (e) => {
            if (
                isFromNetworkList &&
                e.target.id !== "from_caller" &&
                !fromRef.current.contains(e.target)
            ) {
                setIsFromNetworkList(false);
            }

            if (
                isToNetworkList &&
                e.target.id !== "to_caller" &&
                !toRef.current.contains(e.target)
            ) {
                setIsToNetworkList(false);
            }

            if (
                isCoinList &&
                e.target.id !== "coin_caller" &&
                !availableRef.current.contains(e.target)
            ) {
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
        <div className="flex flex-col bg-gray-700 p-4">
            <div className="flex flex-col lg:flex-row  lg:space-x-3">
                <div className="basis-1/3 flex flex-col items-start m-2 w-full">
                    <div className="w-full">
                        <div className="text-xs pl-1">Source</div>
                        <div className="py-1 relative">
                            <div
                                id="from_caller"
                                className="flex p-3 font-semibold bg-black-900 rounded-md justify-between cursor-pointer"
                                onClick={() => setIsFromNetworkList(!isFromNetworkList)}
                            >
                                <span id="from_caller" className="mx-1">{selectedFromNetwork?.name}</span>
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
                                className={`absolute w-full bg-gray-700 rounded-md shadow-md shadow-slate-600 my-1 ${
                                    isFromNetworkList ? "block" : "hidden"
                                } z-10`}
                                ref={fromRef}
                            >
                                <ul className="list-reset">
                                    {networks.map((network, index) => (
                                        <li key={index} onClick={() => onSelectSouceChain(network)}>
                                            <p
                                                className={`p-2 block hover:bg-black-900 cursor-pointer ${
                                                    selectedFromNetwork?.name === network?.name &&
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
                    </div>

                    <div
                        className="flex self-center items-center mx-auto -mb-4 w-9 h-9 bg-gray-500 rounded-full cursor-pointer"
                        onClick={() => networkSwap()}
                    >
                        <div className="transform-gpu m-auto">
                            <img
                                className="w-4 h-5 align-middle"
                                src={"/images/icon/exchange.png"}
                                alt="netswap"
                            />
                        </div>
                    </div>

                    <div className="w-full">
                        <div className="text-xs">Destination</div>

                        <div className="py-1 relative">
                            <div
                                id="to_caller"
                                className="flex p-3 font-semibold bg-black-900 rounded-md justify-between cursor-pointer"
                                onClick={() => setIsToNetworkList(!isToNetworkList)}
                            >
                                <span id="to_caller" className="mx-1">{selectedToNetwork?.name}</span>
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
                                className={`absolute w-full bg-gray-700 rounded-md shadow-md shadow-slate-600  my-1 ${
                                    isToNetworkList ? "block" : "hidden"
                                } z-10`}
                                ref={toRef}
                            >
                                <ul className="list-reset">
                                    {networks
                                        .filter((e) => {
                                            return (
                                                selectedFromNetwork?.id !== e.id &&
                                                !(
                                                    selectedCoin?.name === "pUSD" &&
                                                    (e.id === 5 || e.id === 1)
                                                )
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
                                                    className={`p-2 block hover:bg-black-900 cursor-pointer ${
                                                        selectedToNetwork?.name === network?.name &&
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
                    </div>
                </div>
                <div className="flex basis-2/3 flex-col w-full m-2 ">
                    <div className="flex pb-1 ml-1 justify-between w-full text-xs">
                        <span>{`Available `}</span>
                        <span className="mx-1 font-medium">{` ${formatCurrency(
                            getBalance(),
                            4
                        )}`}</span>
                    </div>
                    <div className="flex flex-col w-full">
                        <div className="flex lg:rounded-md bg-black-900 justify-between w-full">
                            <div className="py-1 relative font-semibold">
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
                                    className={`absolute w-full bg-gray-700 rounded-md shadow-md shadow-slate-600 my-2 ${
                                        isCoinList ? "block" : "hidden"
                                    } z-10`}
                                    ref={availableRef}
                                >
                                    <ul className="list-reset">
                                        {pynths.map((coin) => {
                                            if (
                                                (networkId === 1 || networkId === 5) &&
                                                coin.name === "pUSD"
                                            )
                                                return <></>;
                                            else
                                                return (
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
                                className="w-2/3 bg-black-900 outline-none text-right font-medium rounded-lg px-2 text-base"
                                type="text"
                                value={payAmount}
                                onChange={(e) => setPayAmount(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center my-3 lg:mt-8">
                            <div className="flex flex-col pt-3 w-full">
                                <div className="flex justify-between">
                                    <input
                                        className="cursor-pointer w-full mr-1"
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={per.toString()}
                                        onChange={(e) => setPerAmount(BigInt(e.target.value))}
                                    />
                                </div>
                                <div className="flex flex-row justify-between text-xs text-gray-400 w-full">
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
                                        onClick={() => setPerAmount(25n)}
                                    >
                                        25%
                                    </span>
                                    <span
                                        className={`base-1/5 text-center cursor-pointer ${
                                            per === 50n && "text-blue-600"
                                        }`}
                                        onClick={() => setPerAmount(50n)}
                                    >
                                        50%
                                    </span>
                                    <span
                                        className={`base-1/5 text-center cursor-pointer ${
                                            per === 75n && "text-blue-600"
                                        }`}
                                        onClick={() => setPerAmount(75n)}
                                    >
                                        75%
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
                            <div className="flex items-center self-end h-8 border border-gray-200 rounded-md text-sm ml-1 px-1 bg-black-900">
                                <input
                                    className="w-6 bg-black-900 outline-none"
                                    type="number"
                                    max="100"
                                    value={per.toString()}
                                    onChange={(e) =>
                                        setPerAmount(
                                            Number(e.target.value) > 100
                                                ? BigInt("100")
                                                : BigInt(e.target.value)
                                        )
                                    }
                                />
                                %
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-10">
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
                className="btn-base flex flex-row items-center my-6 py-2 w-full text-inherent lg:w-80 lg:mx-auto"
                onClick={() => bridgeConfirm()}
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

            <div className="w-auto text-gray-300 items-center p-2">
                <span className="text-lg font-bold pb-4">Notice</span>
                <p className="leading-tight">
                    It may take up to 10 minutes before the bridged tokens appearing on ‘Receive’
                    tab.
                </p>
            </div>
        </div>
    );
};
export default Submit;
