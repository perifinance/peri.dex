import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'reducers';
import { getSettleds } from 'lib/thegraph/api'

const OrderHistories = ({}) => {
    const dispatch = useDispatch()
    const { isReady } = useSelector((state: RootState) => state.app);
    const { networkId, address, isConnect } = useSelector((state: RootState) => state.wallet);
    const [ history, setHistory ] = useState([]);

    const init = useCallback(async () => {
        const dd = await getSettleds({address})
        setHistory(dd)
    }, [address, getSettleds, setHistory])
    useEffect(() => {
        if(address) {
            init();
        }
    }, [address])

    useEffect(() => {
        if(!isConnect) {
            setHistory([]);
        }
    },[isConnect])

    return (
        history.length > 0 &&
        <div className="w-full bg-gray-700 rounded-lg p-4 my-8">
            <div className="flex flex-col">
                <div className="text-xl">Trade Order</div>
                <table className="table-auto mt-10 mb-12">
                    <thead>
                        <tr className="text-lg border-b border-gray-500">
                            <th className="font-medium">Pair</th>
                            <th className="font-medium">Date</th>
                            <th className="font-medium">Rate</th>
                            <th className="font-medium">Pay</th>
                        </tr>
                    </thead>
                    
                        <tbody className="text-xs">
                            {history.map((e) => (
                                <tr className="border-b border-gray-500 h-8" key={e.id}>
                                    <td className="text-center">{e.dest}/{e.src}</td>
                                    <td className="text-center">{e.timestamp}</td>
                                    {/* <td className="text-center">{e.amount}</td> */}
                                    {/* <td className="text-center">{e.amount}</td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
            </div>
        </div>
    )
}
export default OrderHistories;