import { useCallback, useEffect, useState } from 'react';
import { useDispatch ,useSelector } from 'react-redux';
import { RootState } from 'reducers';
import { contracts, formatCurrency } from 'lib'
import { SUPPORTED_NETWORKS } from 'lib/network'

import { getpUSDBalances } from 'lib/balance'
import { getNetworkFee } from 'lib/fee'
import { updateTransaction } from 'reducers/transaction'

import networkInfo from 'configure/networkInfo/networkInfo'
import NetworkList from 'screens/NetworkList'
import { utils } from 'ethers';
import Receive from 'screens/Receive'


const Bridge = () => {
    const dispatch = useDispatch();
    const { isReady } = useSelector((state: RootState) => state.app);
    const { address, networkId } = useSelector((state: RootState) => state.wallet);
    const [payAmount, setPayAmount] = useState('0');
    
    const [networks, setNetworks] = useState([]);
    const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);
    const [selectedNetworkType, setSelectedNetworkType] = useState('from');
    const [isNetworkList, setIsNetworkList] = useState(false);
    const [tabType, setTabType] = useState('submit')
    
    const changePayAmount = (value) => {
        setPayAmount(value);
    };

    const switchChain = async (selectedNetwork) => {
        try {
            // @ts-ignore
            await window.ethereum?.request({
              method: 'wallet_switchEthereumChain',
              params: [{chainId: networkInfo[selectedNetwork.id].chainId}],
            });
        } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
            try {
                // @ts-ignore
                await window.ethereum?.request({
                    method: 'wallet_addEthereumChain',
                    params: [networkInfo[selectedNetwork.id]],
                });
            } catch (addError) {
            // handle "add" error
            }
        }
        // handle other "switch" errors
        }
    }

    const getGasEstimate = async () => {
        let gasLimit = 600000n;
        try {
            gasLimit = BigInt((await contracts.signers.pUSD.estimateGas.overchainTransfer(
                utils.parseEther(payAmount), selectedNetworkType === 'from' ? 1287 : selectedNetwork.id
            )));
        } catch(e) {
            console.log(e);
            return (gasLimit * 12n /10n).toString();
        }
        
    }

    const bridgeConfrim = async () => {
        const transactionSettings = {
            gasPrice: (await getNetworkFee(selectedNetwork.id) * 10n ** 9n).toString(),
            gasLimit: await getGasEstimate(),
        }

        try {
            let transaction;
            transaction = await contracts.signers.pUSD.overchainTransfer( 
                utils.parseEther(payAmount), selectedNetworkType === 'from' ? 1287 : selectedNetwork.id, transactionSettings
            )
            dispatch(updateTransaction(
                {
                    hash: transaction.hash,
                    message: `overchainTransfer`,
                    type: 'overchainTransfer'
                }
            ));
        } catch(e) {

        }
        
    }

    const bridgeNetwork = () => {
        setSelectedNetworkType(selectedNetworkType === 'to' ? 'from' : 'to');
    }

    const initBalances = useCallback(async() => {
        let networks = Object.keys(SUPPORTED_NETWORKS).filter(e => [42, 97, 1287, 80001].includes(Number(e))).map(e => {
            return {name: SUPPORTED_NETWORKS[e], id: Number(e)}
        })
        
        const balances = await (getpUSDBalances(networks, address));
        networks = networks.map((e, i) => {
            return {...e, balance: BigInt(balances[i])}
        });
        setSelectedNetwork(networks.find(e => networkId === e.id) || networks[0])
        setNetworks(networks);
    }, [address, networkId])
    
    useEffect(() => {
        switchChain(selectedNetwork);
    }, [selectedNetwork, setSelectedNetworkType])

    useEffect(() => {
        if(isReady && address && networkId) {
            initBalances();
            console.log(123);
        }
    }, [initBalances, isReady, address, networkId])

    return (
        <div className="flex space-x-4">
            
            { isNetworkList ? 
                <NetworkList networks={networks} selectedNetwork={selectedNetwork} setSelectedNetwork={setSelectedNetwork} setIsNetworkList={setIsNetworkList}></NetworkList>
                : 
           
                <div className="mb-6 card-width">
                    <ul className='flex cursor-pointer'>
                        <li className={`py-2 px-6 rounded-t-lg ${tabType === 'submit' ? 'bg-gray-700' : 'bg-gray-500'}`} onClick={() => setTabType('submit')}>submit</li>
                        <li className={`py-2 px-6 rounded-t-lg ${tabType === 'receive'? 'bg-gray-700' :  'bg-gray-500'}`} onClick={() => setTabType('receive')}>receive</li>
                    </ul>
                    {tabType === 'submit' ?            
                        <div className="w-full bg-gray-700 rounded-b-lg p-4">   
                            <div className="py-1 w-full">
                                <div>From</div>
                            </div>
                            
                            <div className="py-1">
                                <div className="flex p-3 font-semibold cursor-pointtext-center bg-gray-900 rounded-md justify-between" onClick={() => selectedNetworkType === 'from' && setIsNetworkList(true)}>
                                    <span className="mx-1">{selectedNetworkType === 'from' ? selectedNetwork?.name : 'moonBase'}</span>
                                    {
                                        selectedNetworkType === 'from' && 
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" onClick={() => {}}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    }
                                </div>
                            </div>

                            <div className="w-full mt-4"><img className="mx-auto w-9 h-9" src={'/images/icon/exchange.svg'} alt="exchage" onClick={() => bridgeNetwork()}></img></div>

                            <div className="py-1 w-full">
                                <div>To</div>
                            </div>
                            <div className="py-1">
                                <div className="flex p-3 font-semibold cursor-pointtext-center bg-gray-900 rounded-md justify-between" onClick={() => selectedNetworkType === 'to' && setIsNetworkList(true)}>
                                    <span className="mx-1">{selectedNetworkType === 'to' ? selectedNetwork?.name : 'moonBase'}</span>
                                    {
                                        selectedNetworkType === 'to' && 
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    }
                                    
                                </div>
                            </div>

                            <div className="flex py-1 justify-between w-full">
                                <div></div>
                                <div>Available: {formatCurrency(selectedNetwork?.balance, 4)}</div>
                            </div>
                            <div className="flex justify-between items-center rounded-md bg-black text-base">
                            
                                <div className="flex p-3 font-semibold cursor-pointtext-center">
                                    <div className="mx-1">pUSD</div>
                                </div>    
                                <input className="bg-black pr-3 outline-none text-right" type="text" value={payAmount} onChange={(e) => changePayAmount(e.target.value)}/>
                            </div>
                            
                            <button className="bg-blue-500 my-6 px-4 py-2 w-full rounded-lg text-center text-white text-2xl" onClick={ () => bridgeConfrim()} disabled={networkId !== selectedNetwork?.id}>
                                Confirm
                            </button>
                            {networkId !== selectedNetwork?.id && 
                                <div className="font-medium text-red-500 text-xs text-center">
                                    <div className="">You are currently connecting to {SUPPORTED_NETWORKS[networkId]}</div>
                                    
                                    <div>
                                        change your wallet network to {selectedNetwork?.name}
                                    </div>
                                </div>
                            }
                            
                        </div>
                    :
                    <Receive selectedNetwork={selectedNetwork} setIsNetworkList={setIsNetworkList}></Receive>
                    }
                </div>
            }
        </div>
    )
}
export default Bridge;