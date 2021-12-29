import { useCallback, useEffect, useState } from 'react';
import { useDispatch ,useSelector } from 'react-redux';
import { RootState } from 'reducers';
import { contracts, formatCurrency } from 'lib'
import { SUPPORTED_NETWORKS } from 'lib/network'
import { getBalancesNetworks } from 'lib/balance'
import { getNetworkFee } from 'lib/fee'
import { updateTransaction } from 'reducers/transaction'
import { changeNetwork } from 'lib/network'
import { getNetworkPrice } from 'lib/price';

import { utils } from 'ethers';
import pynths from 'configure/coins/bridge'

const Submit = ({}) => {
    const dispatch = useDispatch();
    const { isReady } = useSelector((state: RootState) => state.app);
    const { address, networkId, isConnect } = useSelector((state: RootState) => state.wallet);
    const [payAmount, setPayAmount] = useState('0');
    
    const [networks, setNetworks] = useState([]);
    const [selectedFromNetwork, setSelectedFromNetwork] = useState<{name?: string, id?: Number, balance?: {pUSD: bigint, PERI: bigint}}>({});
    const [selectedToNetwork, setSelectedToNetwork] = useState<{name?: string, id?: Number, balance?: {pUSD: bigint, PERI: bigint}}>({});
    const [isFromNetworkList, setIsFromNetworkList] = useState(false);
    const [isToNetworkList, setIsToNetworkList] = useState(false);
    const [isCoinList, setIsCoinList] = useState(false);
    const [selectedCoin, setSelectedCoin] = useState<{name?: string, id?:Number}>({});
    const [initBridge, setInitBridge] = useState(false);
    const [networkFeePrice, setNetworkFeePrice] = useState(0n);
    const [gasPrice, setGasPrice] = useState(0n);
    const changePayAmount = (value) => {
        setPayAmount(value);
    };

    const switchChain = async (selectedNetwork) => {
        changeNetwork(selectedNetwork.id)
    }

    const getBridgeTransferGasCost = async () => {
        return await contracts.SystemSettings.bridgeTransferGasCost();
    }

    const getGasEstimate = async () => {
        let gasLimit = 600000n;
        const contractName = {
            PERI: 'PeriFinance',
            pUSD: 'pUSD'
        }
        try {
            gasLimit = BigInt((await contracts.signers[contractName[selectedCoin.name]].estimateGas.overchainTransfer(
                utils.parseEther(payAmount), selectedToNetwork.id,
                {value: (await getBridgeTransferGasCost()).toString()}
            )));
        } catch(e) {
            console.log(e);
            
        }
        return (gasLimit * 12n /10n);
        
    }

    const getGasPrice = async () => {
        const gasPrice =  (await getNetworkFee(selectedFromNetwork.id));
        const gasLimit =  await getGasEstimate();
        const rate = await getNetworkPrice(networkId);

        setGasPrice(gasPrice);
        setNetworkFeePrice(
            rate * gasPrice * gasLimit / 10n ** 9n
        )
    }

    const bridgeConfrim = async () => {
        const contractName = {
            PERI: 'PeriFinance',
            pUSD: 'pUSD'
        }
        const transactionSettings = {
            gasPrice: (await getNetworkFee(selectedFromNetwork.id) * 10n ** 9n).toString(),
            gasLimit: (await getGasEstimate()).toString(),
            value: (await getBridgeTransferGasCost()).toString()
        }
        try {
            let transaction;
            transaction = await contracts.signers[contractName[selectedCoin.name]].overchainTransfer( 
                utils.parseEther(payAmount), selectedToNetwork.id, transactionSettings,
            )
            dispatch(updateTransaction(
                {
                    hash: transaction.hash,
                    message: `overchainTransfer`,
                    type: 'overchainTransfer',
                    action: () => {initBalances(); setPayAmount('0');}
                }
            ));
        } catch(e) {
            console.log(e);
        }
        
    }

    const networkSwap = () => {
        const fromNetwork = selectedFromNetwork && Object.assign({}, selectedFromNetwork);
        const toNetwork = selectedToNetwork && Object.assign({}, selectedToNetwork);
        if(toNetwork || fromNetwork) {
            setSelectedFromNetwork(toNetwork);
            setSelectedToNetwork(fromNetwork);
        }
    }

    const initBalances = useCallback(async() => {
        
        const pUSDBalances = await (getBalancesNetworks(networks, address, 'ProxyERC20pUSD'));
        const PERIbalances = await (getBalancesNetworks(networks, address, 'ProxyERC20'));
        const networksAddBalances = networks.map((e, i) => {
            return {...e, balance: {
                pUSD: BigInt(pUSDBalances[i]),
                PERI: BigInt(PERIbalances[i]),
            }}
        });
        setNetworks(networksAddBalances);
    }, [networks, address, setNetworks, getBalancesNetworks])

    const amountMax = () => {
        const amount = networks.find(e=>selectedFromNetwork.id === e.id)?.balance[selectedCoin?.name];
        changePayAmount(utils.formatEther(amount));
    }

    // maxSecsLeftInWaitingPeriod
    // waitingPeriodSecs
    useEffect(() => {
        if(selectedFromNetwork && isReady) {
            switchChain(selectedFromNetwork);
        }
    }, [selectedFromNetwork, isReady])

    useEffect(() => {
        if(isConnect && initBridge && address) {
            setSelectedCoin(pynths[0]);
            initBalances();
        } else {
            let networks = Object.keys(SUPPORTED_NETWORKS).filter(e => [97, 1287, 80001].includes(Number(e))).map(e => {
                return {name: SUPPORTED_NETWORKS[e], id: Number(e), balance: {
                    pUSD: BigInt(0),
                    PERI: BigInt(0),
                }}
            })
            setNetworks(networks);
            setSelectedFromNetwork({});
            setSelectedToNetwork({});
        }
    }, [isConnect, initBridge, address]);

    useEffect(() => {
        let networks = Object.keys(SUPPORTED_NETWORKS).filter(e => [97, 1287, 80001].includes(Number(e))).map(e => {
            return {name: SUPPORTED_NETWORKS[e], id: Number(e), balance: {
                pUSD: BigInt(0),
                PERI: BigInt(0),
            }}
        })
        setSelectedCoin(pynths[0]);
        setNetworks(networks);
        setInitBridge(true);
    }, [])

    useEffect(() => {
        let timeout
        if(selectedFromNetwork?.id && networkId && isConnect) {
            timeout = setTimeout(()=> {
                if (payAmount !== '') {
                    getGasPrice();
                }
            }, 1000);
        }
        return () => {
            clearTimeout(timeout);
        }
    }, [payAmount, selectedFromNetwork, networkId, isConnect])
    

    return (
        <div className="flex flex-col bg-gray-700 rounded-lg p-4">
            <div className="flex flex-col lg:flex-row">
                <div className="w-full">
                    <div className="flex py-1">
                        <div className="text-base">From</div>
                    </div>
                    <div className="py-1 relative">
                        <div className="flex p-3 font-semibold bg-black-900 rounded-md justify-between cursor-pointer" onClick={() => setIsFromNetworkList(!isFromNetworkList)}>
                            <span className="mx-1">{selectedFromNetwork?.name}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        <div className={`absolute w-full bg-gray-700 border-2 border-gray-300 rounded my-2 pin-t pin-l ${isFromNetworkList ? 'block' : 'hidden'} z-10`}>
                            <ul className="list-reset">
                                {networks.map(network => 
                                    (<li onClick={ () => {setSelectedFromNetwork(network); setIsFromNetworkList(false)}}><p className={`p-2 block hover:bg-black-900 cursor-pointer ${selectedFromNetwork?.name === network?.name && 'bg-black-900'}`}>
                                        {network?.name}
                                    </p></li>)
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex flex-none mx-auto lg:mt-auto lg:mx-4 my-3 w-9 h-9 bg-gray-500 rounded-full cursor-pointer" onClick={() => networkSwap()}>
                    <div className="transform-gpu m-auto lg:rotate-90">
                        <img className="w-4 h-5 align-middle" src={'/images/icon/exchange.png'}></img>
                    </div>
                </div>

                <div className="w-full">
                    
                    <div className="flex py-1">
                        <div>To</div>
                    </div>
                    
                    <div className="py-1 relative">
                        <div className="flex p-3 font-semibold bg-black-900 rounded-md justify-between cursor-pointer" onClick={() => setIsToNetworkList(!isToNetworkList)}>
                            <span className="mx-1">{selectedToNetwork?.name}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        <div className={`absolute w-full bg-gray-700 border-2 border-gray-300 rounded my-2 pin-t pin-l ${isToNetworkList ? 'block' : 'hidden'} z-10`}>
                            <ul className="list-reset">
                                {networks.filter(e=> selectedFromNetwork?.id !== 1287 ? e.id === 1287 : e.id !== 1287).map(network => 
                                    (<li onClick={ () => {setSelectedToNetwork(network); setIsToNetworkList(false)}}><p className={`p-2 block hover:bg-black-900 cursor-pointer ${selectedToNetwork?.name === network?.name && 'bg-black-900'}`}>
                                        {network?.name}
                                    </p></li>)
                                )}
                            </ul>
                        </div>
                    </div>
                </div>                                
            </div>

            <div className="flex py-1 justify-between w-full">
                <div></div>
                <div>Available: {formatCurrency(selectedFromNetwork && networks.find(e=>selectedFromNetwork.id === e.id)?.balance[selectedCoin?.name], 4)}</div>
            </div>
            <div className="flex flex-row justify-end">
                <div className="flex rounded-l-md rounded-r-none lg:rounded-md bg-black-900 text-base p-2 space-x-4 justify-between lg:w-5/12">
                    <div className="relative">
                        <div className="flex font-medium cursor-pointer items-center" onClick={() => setIsCoinList(!isCoinList)}>
                            <img className="w-6 h-6" src={`/images/currencies/${selectedCoin?.name}.svg`}></img>
                            <div className="m-1">{selectedCoin?.name}</div>
                            <img className="w-4 h-2" src={`/images/icon/bottom_arrow.png`}></img>
                        </div>
                        <div className={`absolute w-full bg-gray-700 border-2 border-gray-300 rounded my-2 pin-t pin-l ${isCoinList ? 'block' : 'hidden'} z-10`}>
                            <ul className="list-reset">

                                {pynths.map(coin => 
                                    (<li onClick={ () => {setSelectedCoin(coin); setIsCoinList(false)}}><p className={`flex space-x-2 p-2 hover:bg-black-900 cursor-pointer ${selectedCoin?.name === coin?.name && 'bg-black-900'}`}>
                                        
                                        <img className="w-6 h-6" src={`/images/currencies/${coin?.name}.svg`}></img>
                                        {coin?.name}
                                        
                                    </p></li>)
                                )}
                            </ul>
                        </div>
                    </div>

                    <input className="w-2/3 bg-black-900 outline-none text-right font-medium" type="text" value={payAmount} onChange={(e) => changePayAmount(e.target.value)}/>
                    
                </div>
                <button className="bg-red-500 rounded-r-md px-2 lg:hidden" onClick={() => amountMax()}>M</button>
                <button className="ml-4 bg-red-500 rounded-md px-2 hidden lg:block" onClick={() => amountMax()}>Max</button>
            </div>
            
            <div className="pt-4">
                <div className="flex py-2 justify-between w-full lg:justify-center">
                    <div className="lg:text-lg">Network Fee({gasPrice.toString()}GWEI)</div>
                    <div className="lg:text-lg lg:px-2 lg:font-semibold">${formatCurrency(networkFeePrice, 4)}</div>
                </div>
            </div>
            
            <button className="bg-blue-500 my-6 px-4 py-2 w-full rounded-lg text-center text-white text-2xl lg:w-80 lg:mx-auto" onClick={ () => bridgeConfrim()} disabled={networkId !== selectedFromNetwork?.id || !selectedToNetwork?.id}>
                Confirm
            </button>
            {!isConnect ? 
                <div className="font-medium text-red-500 text-xs text-center">
                    <div className="">You are currently connecting in app</div>
                </div>
                : selectedFromNetwork && networkId !== selectedFromNetwork?.id ? 
                <div className="font-medium text-red-500 text-xs text-center">
                    <div className="">You are currently connecting to {SUPPORTED_NETWORKS[networkId]}</div>
                    
                    <div>
                        change your wallet network to {selectedFromNetwork?.name}
                    </div>
                </div>
                
                : selectedToNetwork?.id ? <></> : <div className="font-medium text-red-500 text-xs text-center">
                    <div className="">Please select the network (To) </div>
                </div>
            }

            <div className="w-auto text-gray-300 items-center p-2">
                <span className="text-lg font-bold pb-4">
                    Notice
                </span>
                <p className="leading-tight">
                    Tokens you have confirmed on the ‘Submit’ tab may take up to 10 mins for arrival on the ‘Receive’ tab.

                </p>
            </div>
        </div>
                    
    )
}
export default Submit;