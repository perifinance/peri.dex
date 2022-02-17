import { useEffect, useState } from 'react';
import { useDispatch ,useSelector } from 'react-redux';
import { RootState } from 'reducers';
import { contracts, formatCurrency } from 'lib'
import { SUPPORTED_NETWORKS } from 'lib/network'
import { getNetworkFee } from 'lib/fee'
import { updateTransaction } from 'reducers/transaction'
import { getNetworkPrice } from 'lib/price';
import { changeNetwork } from 'lib/network'

import pynths from 'configure/coins/bridge'
const ableNetworks = JSON.parse(process.env.REACT_APP_BRIDGE_NETWORKS);
const Receive = ({}) => {
    const dispatch = useDispatch();
    const { isReady } = useSelector((state: RootState) => state.app);
    const { address, networkId, isConnect } = useSelector((state: RootState) => state.wallet);
    const [receiveDatas, setReceiveDatas] = useState({});
    const [totalAmount, setTotalAmount] = useState(0n);
    const [networks, setNetworks] = useState([]);
    const [isNetworkList, setIsNetworkList] = useState(false);
    const [selectedNetwork, setSelectedNetwork] = useState<{name?: string, id?: Number}>({});
    const [isCoinList, setIsCoinList] = useState(false);
    const [selectedCoin, setSelectedCoin] = useState<{name?: string, id?:Number}>({});
    const [networkFeePrice, setNetworkFeePrice] = useState<bigint>(0n);
    const [gasPrice, setGasPrice] = useState(0n);

    const setNetwork = async () => {
        
        const networks = Object.keys(SUPPORTED_NETWORKS).filter(e => ableNetworks.includes(Number(e))).map(e => {
            return {name: SUPPORTED_NETWORKS[e], id: Number(e)}
        });
        setNetworks(networks);
    }

    const getInboundings = async () => {
        const contractName = {
            PERI: 'BridgeState',
            pUSD: 'BridgeStatepUSD'
        }
        try {
            const ids = await contracts[contractName[selectedCoin.name]].applicableInboundIds(address);
            let datas = [];
            let totalAmount = 0n;
            ids.forEach((e) => {
                datas.push(contracts[contractName[selectedCoin.name]].inboundings(e).then(e => {
                    const amount = BigInt(e.amount);
                    totalAmount = totalAmount + amount;
                    return {amount, chainId: e.srcChainId.toString()}
                }));
            });
            let promiseData = await Promise.all(datas);
            let returnValue = {};
            ableNetworks.forEach(e => {
                returnValue[e] = 0n
            });
            
            promiseData.forEach(data => {
                if(returnValue[data.chainId]) {
                    returnValue[data.chainId] = returnValue[data.chainId] + data.amount;
                } else {
                    returnValue[data.chainId] = data.amount;
                }
            })
            setTotalAmount(totalAmount)
            setReceiveDatas(returnValue);
        } catch(e) {
            console.log(e);
        }
    }

    const getGasEstimate = async () => {
        const contractName = {
            PERI: 'PeriFinance',
            pUSD: 'pUSD'
        }
        let gasLimit = 600000n;
        try {
            gasLimit = BigInt((await contracts.signers[contractName[selectedCoin.name]].estimateGas.claimAllBridgedAmounts({value: (await getBridgeClaimGasCost()).toString()})));
            if(gasLimit) {
                return 600000n;
            }
        } catch(e) {
            return (gasLimit * 12n /10n);
        }
        
    }

    const getGasPrice = async () => {
        const gasPrice =  (await getNetworkFee(selectedNetwork.id));
        const gasLimit =  await getGasEstimate();
        const rate = await getNetworkPrice(networkId);

        setGasPrice(gasPrice);
        
        setNetworkFeePrice(
            rate * gasPrice * gasLimit / 10n ** 9n
        )
    }

    const getBridgeClaimGasCost = async () => {
        return await contracts.SystemSettings.bridgeClaimGasCost();
    }

    const confrim = async () => {
        const contractName = {
            PERI: 'PeriFinance',
            pUSD: 'pUSD'
        }
        const transactionSettings = {
            gasPrice: (await getNetworkFee(selectedNetwork.id) * 10n ** 9n).toString(),
            gasLimit: (await getGasEstimate()).toString(),
            value: (await getBridgeClaimGasCost()).toString()
        }

        try {
            let transaction;
            transaction = await contracts.signers[contractName[selectedCoin.name]].claimAllBridgedAmounts(transactionSettings)
            dispatch(updateTransaction(
                {
                    hash: transaction.hash,
                    message: `overchainTransfer`,
                    type: 'overchainTransfer',
                    action: getInboundings,
                }
            ));
        } catch(e) {

        }
        
    }
    const switchChain = async (selectedNetwork) => {
        changeNetwork(selectedNetwork.id)
    }

    useEffect(() => {
        if(selectedNetwork && isReady) {
            switchChain(selectedNetwork);
        }
    }, [selectedNetwork, isReady])

    useEffect(() => {
        setNetwork();
        setSelectedCoin({id: 0, name: 'pUSD'});
        let returnValue = {};
        ableNetworks.forEach(e => {
            returnValue[e] = 0n
        });
        setReceiveDatas(returnValue);
    }, [])

    useEffect(() => {
        let setIntervals;
        if(selectedNetwork?.id === networkId && selectedCoin?.name && isConnect) {
            getInboundings();
            setIntervals = setInterval(() => {getInboundings()}, 1000 * 60);
        }
        return () => {
            clearInterval(setIntervals)
        }
    },[isConnect, selectedNetwork, selectedCoin, networkId])

    useEffect(() => {
        let timeout
        if(selectedNetwork?.id && networkId && isConnect) {
            timeout = setTimeout(()=> {
                if (totalAmount === 0n) {
                    getGasPrice();
                }
            }, 1000);
        }
        return () => {
            clearTimeout(timeout);
        }
    }, [totalAmount, selectedNetwork, networkId, isConnect])

    return (
        <div className="flex flex-col bg-gray-700 rounded-lg p-4 overflow-hidden">
            <div className="w-full">
                <div className="flex py-1">
                    <div>To</div>
                </div>
            </div>
            <div className="w-full">
                <div className="flex flex-col lg:flex-row lg:space-x-2">
                    <div className="py-1 relative w-full">
                        <div className="flex p-3 font-semibold bg-black-900 rounded-md justify-between cursor-pointer" onClick={() => setIsNetworkList(!isNetworkList)}>
                            <span className="mx-1">{selectedNetwork?.name}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        <div className={`absolute w-full bg-gray-700 border-2 border-gray-300 rounded my-2 pin-t pin-l ${isNetworkList ? 'block' : 'hidden'} z-10`}>
                            <ul className="list-reset">
                                {networks.map(network => 
                                    (<li onClick={ () => {setSelectedNetwork(network); setIsNetworkList(false)}}><p className={`p-2 block hover:bg-black-900 cursor-pointer ${selectedNetwork?.name === network?.name && 'bg-black-900'}`}>
                                        {network?.name}
                                    </p></li>)
                                )}
                            </ul>
                        </div>    
                    </div>
                    <div className="py-1 relative w-full">
                        <div className="flex justify-between items-center rounded-md bg-black-900 text-base">
                            <div className="relative">
                                <div className="flex p-3 font-semibold cursor-pointer" onClick={() => setIsCoinList(!isCoinList)}>
                                    <img className="w-6 h-6" src={`/images/currencies/${selectedCoin?.name}.png`}></img>
                                    <div className="mx-1">{selectedCoin?.name}</div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                <div className={`absolute w-full bg-gray-700 border-2 border-gray-300 rounded my-2 pin-t pin-l ${isCoinList ? 'block' : 'hidden'} z-10`}>
                                        <ul className="list-reset">
                                            {pynths.map(coin => 
                                                (<li onClick={ () => {setSelectedCoin(coin); setIsCoinList(false)}}><p className={`flex space-x-2 p-2 hover:bg-black-900 cursor-pointer ${selectedCoin?.name === coin?.name && 'bg-black-900'}`}>
                                                    <img className="w-6 h-6" src={`/images/currencies/${coin?.name}.png`}></img>
                                                    {coin?.name}
                                                </p></li>)
                                            )}
                                        </ul>
                                    </div>
                            </div>
                            <input className="bg-black-900 pr-3 outline-none text-right" type="text" value={formatCurrency(totalAmount, 4)} disabled/>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col my-5 text-base overflow-y-scroll text-center border-gray-300 border-b-2 border-t-2">
                <div className="flex flex-row">
                    <div className="font-medium bg-black-900 py-4 border-gray-300 min-w-36 w-full border-b">From</div>
                    {Object.keys(receiveDatas).map(e => (
                        <div className="border-gray-300 py-4 min-w-36 w-full border border-r-0">{SUPPORTED_NETWORKS[e]} </div>
                    ))}
                </div>
                <div className="flex flex-row">
                    <div className="font-medium bg-black-900 py-4 border-gray-300 min-w-36 w-full">Amount</div>
                    {Object.values(receiveDatas).map(amount => (
                        <div className="border-gray-300 py-4 min-w-36 w-full border border-r-0 border-t-0">{formatCurrency(amount,4)} <span className="font-medium pl-1">{selectedCoin?.name}</span></div>
                    ))}
                </div>        
            </div>
            
            <div className="pt-4">
                <div className="flex py-2 justify-between w-full lg:justify-center">
                    <div className="lg:text-lg">Network Fee({gasPrice.toString()}GWEI)</div>
                    <div className="lg:text-lg lg:px-2 lg:font-semibold">${formatCurrency(networkFeePrice, 4)}</div>
                </div>
            </div>
            
            <button className="bg-blue-500 my-6 px-4 py-2 w-full rounded-lg text-center text-white text-2xl lg:w-80 lg:mx-auto" onClick={ () => confrim()} disabled={networkId !== selectedNetwork?.id || !selectedNetwork?.id || totalAmount === 0n}>
                Confirm
            </button>
    
            {!isConnect ? 
                <div className="font-medium text-red-500 text-xs text-center">
                    <div className="">You are currently connecting in app</div>
                </div>
                : selectedNetwork && networkId !== selectedNetwork?.id &&
                <div className="font-medium text-red-500 text-xs text-center">
                    <div className="">You are currently connecting to {SUPPORTED_NETWORKS[networkId]}</div>
                    
                    <div>
                        change your wallet network to {selectedNetwork?.name}
                    </div>
                </div>
            }
            
        </div>
    )
}
export default Receive;