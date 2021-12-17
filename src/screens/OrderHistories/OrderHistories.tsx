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
    const [ page, setPage ] = useState(0);

    const init = useCallback(async () => {
        const history = await getExchageHistories({address, page})
        setHistory(history)
    }, [address, getExchageHistories, setHistory, page])
    
    useEffect(() => {
        if(address && !transaction.hash) {
            if(networkId === Number(process.env.REACT_APP_DEFAULT_NETWORK_ID)) {
                init();
            } else {
                changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID);
                setHistory([]);
            }
        } 
    }, [address, transaction, networkId, page])

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
                    <table className="table-auto mt-10 mb-2 lg:w-full">
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
                <ul className="flex list-reset rounded font-sans self-center">
                        {/* <li><a className="block hover:text-white hover:bg-blue text-blue border-r border-grey-light px-3 py-2" href="#">Previous</a></li> */}
                        <li><a className={`block hover:text-white hover:underline text-blue px-3 py-2 cursor-pointer ${page === 0 ? 'underline': 'none'} `} onClick={() => setPage(0)}>1</a></li>
                        <li><a className={`block hover:text-white hover:underline text-blue px-3 py-2 cursor-pointer ${page === 1 ? 'underline': 'none'} `} onClick={() => setPage(1)}>2</a></li>
                        <li><a className={`block hover:text-white hover:underline text-blue px-3 py-2 cursor-pointer ${page === 2 ? 'underline': 'none'} `} onClick={() => setPage(2)}>3</a></li>
                        <li><a className={`block hover:text-white hover:underline text-blue px-3 py-2 cursor-pointer ${page === 3 ? 'underline': 'none'} `} onClick={() => setPage(3)}>4</a></li>
                        <li><a className={`block hover:text-white hover:underline text-blue px-3 py-2 cursor-pointer ${page === 4 ? 'underline': 'none'} `} onClick={() => setPage(4)}>5</a></li>
                        <li><a className={`block hover:text-white hover:underline text-blue px-3 py-2 cursor-pointer ${page === 5 ? 'underline': 'none'} `} onClick={() => setPage(5)}>6</a></li>
                        <li><a className={`block hover:text-white hover:underline text-blue px-3 py-2 cursor-pointer ${page === 6 ? 'underline': 'none'} `} onClick={() => setPage(6)}>7</a></li>
                        <li><a className={`block hover:text-white hover:underline text-blue px-3 py-2 cursor-pointer ${page === 7 ? 'underline': 'none'} `} onClick={() => setPage(7)}>8</a></li>
                        <li><a className={`block hover:text-white hover:underline text-blue px-3 py-2 cursor-pointer ${page === 8 ? 'underline': 'none'} `} onClick={() => setPage(8)}>9</a></li>
                        <li><a className={`block hover:text-white hover:underline text-blue px-3 py-2 cursor-pointer ${page === 9 ? 'underline': 'none'} `} onClick={() => setPage(9)}>10</a></li>
                        {/* <li><a className="block hover:text-white hover:bg-blue text-blue px-3 py-2" href="#">Next</a></li> */}
                    </ul>
            </div>
        </div>
    )
}
export default OrderHistories;