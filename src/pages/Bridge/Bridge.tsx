import { useCallback, useEffect, useState } from 'react';
import { useDispatch ,useSelector } from 'react-redux';
import { RootState } from 'reducers';
import { contracts, formatCurrency } from 'lib'
import { SUPPORTED_NETWORKS } from 'lib/network'
import { getBalancesNetworks } from 'lib/balance'
import { getNetworkFee } from 'lib/fee'
import { updateTransaction } from 'reducers/transaction'
import { changeNetwork } from 'lib/network'

import NetworkList from 'screens/NetworkList'
import { utils } from 'ethers';
import Receive from 'screens/Receive'
import pynths from 'configure/coins/bridge'
import BridgeCoinList from 'screens/BridgeCoinList'
const Bridge = () => {
    const dispatch = useDispatch();
    const { isReady } = useSelector((state: RootState) => state.app);
    const { address, networkId, isConnect } = useSelector((state: RootState) => state.wallet);
    const [payAmount, setPayAmount] = useState('0');
    const [selectedCoin, setSelectedCoin] = useState<{name?: string, id?:Number}>({});
    const [networks, setNetworks] = useState([]);
    const [selectedFromNetwork, setSelectedFromNetwork] = useState<{name?: string, id?: Number, balance?: {pUSD: bigint, PERI: bigint}}>();
    const [selectedToNetwork, setSelectedToNetwork] = useState<{name?: string, id?: Number, balance?: {pUSD: bigint, PERI: bigint}}>();
    const [isFromNetworkList, setIsFromNetworkList] = useState(false);
    const [isToNetworkList, setIsToNetworkList] = useState(false);
    const [isCoinList, setIsCoinList] = useState(false);
    const [tabType, setTabType] = useState('submit')
    const [initBridge, setInitBridge] = useState(false);
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
            return (gasLimit * 12n /10n).toString();
        }
        
    }

    const bridgeConfrim = async () => {
        const contractName = {
            PERI: 'PeriFinance',
            pUSD: 'pUSD'
        }
        const transactionSettings = {
            gasPrice: (await getNetworkFee(selectedFromNetwork.id) * 10n ** 9n).toString(),
            gasLimit: await getGasEstimate(),
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
                    action: initBalances
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
    }, [networks, address, networkId, setNetworks])
    
    useEffect(() => {
        if(selectedFromNetwork && isReady) {
            switchChain(selectedFromNetwork);
        }
    }, [selectedFromNetwork, isReady])

    useEffect(() => {
        if(isConnect && initBridge) {
            setSelectedCoin(pynths[0]);
            initBalances();
        } else {
            let networks = Object.keys(SUPPORTED_NETWORKS).filter(e => [42, 97, 1287, 80001].includes(Number(e))).map(e => {
                return {name: SUPPORTED_NETWORKS[e], id: Number(e), balance: {
                    pUSD: BigInt(0),
                    PERI: BigInt(0),
                }}
            })
            setNetworks(networks);
            setSelectedFromNetwork(null);
            setSelectedToNetwork(null);
        }
    }, [isConnect, initBridge]);

    useEffect(() => {
        let networks = Object.keys(SUPPORTED_NETWORKS).filter(e => [42, 97, 1287, 80001].includes(Number(e))).map(e => {
            return {name: SUPPORTED_NETWORKS[e], id: Number(e), balance: {
                pUSD: BigInt(0),
                PERI: BigInt(0),
            }}
        })
        setSelectedCoin(pynths[0]);
        setNetworks(networks);
        setInitBridge(true);
    }, [])

    return (
        <div className="flex space-x-4">
            
            { 
                <div className="mb-6 card-width">
                    <ul className='flex cursor-pointer'>
                        <li className={`py-2 px-6 rounded-t-lg ${tabType === 'submit' ? 'bg-gray-700' : 'bg-gray-500'}`} onClick={() => setTabType('submit')}>submit</li>
                        <li className={`py-2 px-6 rounded-t-lg ${tabType === 'receive'? 'bg-gray-700' :  'bg-gray-500'}`} onClick={() => setTabType('receive')}>receive</li>
                    </ul>
                    {
                        isFromNetworkList ? <NetworkList networks={networks} selectedNetwork={selectedFromNetwork} setSelectedNetwork={setSelectedFromNetwork} setIsNetworkList={setIsFromNetworkList}></NetworkList>  :
                        isToNetworkList ? <NetworkList networks={selectedFromNetwork?.id !== 1287 ? networks.filter(e=> e.id === 1287) : networks.filter(e=> e.id !== 1287)} selectedNetwork={selectedToNetwork} setSelectedNetwork={setSelectedToNetwork} setIsNetworkList={setIsToNetworkList}></NetworkList> :
                        isCoinList ? <BridgeCoinList coinList={pynths} setSelectedCoin={setSelectedCoin} setIsCoinList={setIsCoinList}></BridgeCoinList> :
                        tabType === 'submit' ?
                        <div className="w-full bg-gray-700 rounded-b-lg p-4">   
                            <div className="flex py-1">
                                <div>From</div>
                                { !selectedFromNetwork?.id && 
                                    <div className="flex justify-end font-medium tracking-wide text-red-500 text-xs w-full">    
                                        <span>please select from network</span>
                                    </div>
                                }
                            </div>
                            
                            <div className="py-1">
                                <div className="flex p-3 font-semibold bg-gray-900 rounded-md justify-between cursor-pointer" onClick={() => setIsFromNetworkList(true)}>
                                    <span className="mx-1">{selectedFromNetwork?.name}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" onClick={() => {}}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            <div className="w-full mt-4"><img className="mx-auto w-9 h-9 cursor-pointer" src={'/images/icon/exchange.svg'} alt="exchage" onClick={() => networkSwap()}></img></div>

                            <div className="flex py-1">
                                <div>To</div>
                                { !selectedToNetwork?.id && 
                                    <div className="flex justify-end font-medium tracking-wide text-red-500 text-xs w-full">    
                                        <span>please select from network</span>
                                    </div>
                                }
                            </div>
                            <div className="py-1">
                                <div className="flex p-3 font-semibold bg-gray-900 rounded-md justify-between cursor-pointer" onClick={() => setIsToNetworkList(true)}>
                                    <span className="mx-1">{selectedToNetwork?.name}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            <div className="flex py-1 justify-between w-full">
                                <div>{selectedCoin?.name}</div>
                                <div>Available: {formatCurrency(selectedFromNetwork && selectedFromNetwork?.balance[selectedCoin?.name], 4)}</div>
                            </div>
                            <div className="flex justify-between items-center rounded-md bg-black text-base">
                            
                                <div className="flex p-3 font-semibold cursor-pointer" onClick={() => setIsCoinList(true)}>
                                    <img className="w-6 h-6" src={`/images/currencies/${selectedCoin?.name}.svg`}></img>
                                    <div className="mx-1">{selectedCoin?.name}</div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                <input className="bg-black pr-3 outline-none text-right" type="text" value={payAmount} onChange={(e) => changePayAmount(e.target.value)}/>
                            </div>
                            
                            <button className="bg-blue-500 my-6 px-4 py-2 w-full rounded-lg text-center text-white text-2xl" onClick={ () => bridgeConfrim()} disabled={networkId !== selectedFromNetwork?.id || !selectedToNetwork?.id}>
                                Confirm
                            </button>
                            {!isConnect ? 
                                <div className="font-medium text-red-500 text-xs text-center">
                                    <div className="">You are currently connecting in app</div>
                                </div>
                                : selectedFromNetwork && networkId !== selectedFromNetwork?.id &&
                                <div className="font-medium text-red-500 text-xs text-center">
                                    <div className="">You are currently connecting to {SUPPORTED_NETWORKS[networkId]}</div>
                                    
                                    <div>
                                        change your wallet network to {selectedFromNetwork?.name}
                                    </div>
                                </div>
                            }
                        </div>
                    :
                    <Receive selectedNetwork={selectedFromNetwork} setIsNetworkList={setIsFromNetworkList} selectedCoin={selectedCoin} setIsCoinList={setIsCoinList}></Receive>
                    }
                </div>
            }
        </div>
    )
}
export default Bridge;