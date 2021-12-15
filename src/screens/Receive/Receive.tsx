import { useCallback, useEffect, useState } from 'react';
import { useDispatch ,useSelector } from 'react-redux';
import { RootState } from 'reducers';
import { contracts, formatCurrency } from 'lib'
import { SUPPORTED_NETWORKS } from 'lib/network'
import { getNetworkFee } from 'lib/fee'
import { updateTransaction } from 'reducers/transaction'

const Receive = ({selectedNetwork, setIsNetworkList, selectedCoin, setIsCoinList}) => {
    const dispatch = useDispatch();
    const { address, networkId, isConnect } = useSelector((state: RootState) => state.wallet);
    const { isReady } = useSelector((state: RootState) => state.app);
    const [receiveDatas, setReceiveDatas] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0n);

    const getInboundings = async () => {
        const contractName = {
            PERI: 'BridgeState',
            pUSD: 'BridgeStatepUSD'
        }
        try {
            const ids = await contracts[contractName[selectedCoin.name]].applicableInboundIds(address);
            const datas = [];
            let totalAmount = 0n;
            ids.forEach((e) => {
                datas.push(contracts[contractName[selectedCoin.name]].inboundings(e).then(e => {
                    const amount = BigInt(e.amount);
                    totalAmount = totalAmount + amount;
                    return {amount, chainId: e.srcChainId.toString()}
                }));
            });
            const dd = await Promise.all(datas);
            setTotalAmount(totalAmount)
            setReceiveDatas(dd);
        } catch(e) {
            console.log(e);
        }
      
        // console.log(contracts.pUSD.claimAllBridgedAmounts());
        //id 들을 
    }

    const getGasEstimate = async () => {
        const contractName = {
            PERI: 'PeriFinance',
            pUSD: 'pUSD'
        }
        let gasLimit = 600000n;
        try {
            gasLimit = BigInt((await contracts.signers[contractName[selectedCoin.name]].estimateGas.claimAllBridgedAmounts({value: (await getBridgeClaimGasCost()).toString()})));
        } catch(e) {
            console.log(e);
            return (gasLimit * 12n /10n).toString();
        }
        
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
            gasLimit: await getGasEstimate(),
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



    useEffect(() => {
        if(address && networkId && selectedCoin && isReady) {
            getInboundings();
        }
    },[isReady, address, networkId, selectedCoin])

    return (
        <div className="w-full bg-gray-700 rounded-b-lg p-4">   
            <div className="flex py-1">
                <div>Receive</div>
                { !selectedNetwork?.id && 
                    <div className="flex justify-end font-medium tracking-wide text-red-500 text-xs w-full">    
                        <span>please select from network</span>
                    </div>
                }
            </div>
            <div className="flex p-3 font-semibold cursor-pointer bg-gray-900 rounded-md justify-between" onClick={() => setIsNetworkList(true)}>
                <span className="mx-1">{selectedNetwork?.name}</span>
                {
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                }
            </div>
            <div className="flex w-full">
                <table className="table-auto mt-10 mb-12 w-full">
                    <thead>
                        <tr className="text-lg border-b border-gray-500">
                            <th className="font-medium">FromNetWork</th>
                            <th className="font-medium">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs">
                        {receiveDatas.length > 0 && receiveDatas.map(data => {
                            return (
                                <tr className="border-b border-gray-500 h-8">
                                    <td className="text-center">{SUPPORTED_NETWORKS[data.chainId]}</td>
                                    <td className="text-center">{formatCurrency(data.amount, 4)} pUSD</td>
                                </tr>
                            ) 
                        }) }
                        
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center rounded-md bg-black text-base">
            
                <div className="flex p-3 font-semibold cursor-pointer" onClick={() => setIsCoinList(true)}>
                    <img className="w-6 h-6" src={`/images/currencies/${selectedCoin?.name}.svg`}></img>
                    <div className="mx-1">{selectedCoin?.name}</div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>    
                <input className="bg-black pr-3 outline-none" type="text" dir="rtl" value={formatCurrency(totalAmount, 4)} disabled/>
            </div>
            
            <button className="bg-blue-500 my-6 px-4 py-2 w-full rounded-lg text-center text-white text-2xl" onClick={ () => confrim()} disabled={networkId !== selectedNetwork?.id || !selectedNetwork?.id}>
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