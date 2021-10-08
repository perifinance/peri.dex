import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'reducers';
import { getExchangeRates, getFeeRateForExchange } from 'lib/rates'
import { getBalance } from 'lib/balance'
import { contracts } from 'lib';
import { utils } from 'ethers';
import { formatCurrency } from 'lib'
import { updateTransaction } from 'reducers/transaction'
import { getNetworkFee } from 'lib/fee'
import { getNetworkPrice } from 'lib/price';
const OrderHistories = ({}) => {
    const dispatch = useDispatch()
    const { isReady } = useSelector((state: RootState) => state.app);
    const { networkId, address } = useSelector((state: RootState) => state.wallet);
    
    return (
        
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
                        <tr className="border-b border-gray-500 h-8">
                            <td className="text-center">pUSD/pBTC</td>
                            <td className="text-center">21/12/08 12:00</td>
                            <td className="text-center">1,000.00</td>
                            <td className="text-center">265.4503</td>
                        </tr>
                        <tr className="border-b border-gray-500 h-8">
                            <td className="text-center">pUSD/pBTC</td>
                            <td className="text-center">21/12/08 12:00</td>
                            <td className="text-center">1,000.00</td>
                            <td className="text-center">265.45</td>    
                        </tr>
                        <tr className="border-b border-gray-500 h-8">
                            <td className="text-center">pUSD/pBTC</td>
                            <td className="text-center">21/12/08 12:00</td>
                            <td className="text-center">1,000.00</td>
                            <td className="text-center">265.45</td>
                        </tr>
                        <tr className="border-b border-gray-500 h-8">
                            <td className="text-center">pUSD/pBTC</td>
                            <td className="text-center">21/12/08 12:00</td>
                            <td className="text-center">1,000.00</td>
                            <td className="text-center">265.45</td>
                        </tr>
                        <tr className="border-b border-gray-500 h-8">
                            <td className="text-center">pUSD/pBTC</td>
                            <td className="text-center">21/12/08 12:00</td>
                            <td className="text-center">1,000.00</td>
                            <td className="text-center">265.45</td>
                        </tr>
                    </tbody>
                    </table>
            </div>
        </div>
        
    )
}
export default OrderHistories;