import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'reducers';
import { getExchageHistories } from 'lib/thegraph/api'
import { formatCurrency } from 'lib'
import { changeNetwork } from 'lib/network'


const OrderHistories = ({}) => {
    const { address, isConnect, networkId } = useSelector((state: RootState) => state.wallet);
    const transaction = useSelector((state: RootState) => state.transaction);
    const [ history, setHistory ] = useState([]);

    const init = useCallback(async () => {
        const history = await getExchageHistories({address})
        setHistory(history)
    }, [address, getExchageHistories, setHistory])
    
    useEffect(() => {
        if(address && !transaction.hash) {
            if(networkId === Number(process.env.REACT_APP_DEFAULT_NETWORK_ID)) {
                init();
            } else {
                changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID);
                setHistory([]);
            }
        } 
    }, [address, transaction, networkId])

    useEffect(() => {
        if(!isConnect) {
            setHistory([]);
        }
    },[isConnect])

    return (
        
        <div className="w-full bg-gray-700 rounded-lg p-4 mt-4">
            <div className="flex flex-col">
                <div className="text-xl">Trade Order</div>
                <div className="overflow-x-scroll">
                    <table className="table-auto mt-10 mb-12 lg:w-full">
                        <thead>
                            <tr className="text-lg border-b border-gray-500">
                                <th className="font-medium">Pair</th>
                                <th className="font-medium">Rate</th>
                                <th className="font-medium">pay</th>
                                <th className="font-medium">Receive</th>
                                <th className="font-medium">Date</th>
                            </tr>
                        </thead>
                    
                        <tbody className="text-xs">
                            {history.map((e) => (
                                <tr className="border-b border-gray-500 h-8" key={e.id}>
                                    <td className="text-center">{e.dest}/{e.src}</td>
                                    <td className="text-center">{formatCurrency(e.rate, 8)}</td>
                                    <td className="text-center">{formatCurrency(e.amount, 8)} {e.src}</td>
                                    <td className="text-center">{formatCurrency(e.amountReceived, 8)} {e.dest}</td>
                                    <td className="text-center">{e.timestamp}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
export default OrderHistories;