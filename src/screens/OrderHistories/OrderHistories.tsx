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
        
        <div className="w-full bg-gray-800 rounded-lg p-4 mt-8">
            <div className="flex flex-col">
                <div className="text-gray-200 py-8">Trade Order</div>
            
                <table className="table-auto text-gray-200">
                    <thead>
                        <tr>
                            <th>Pair</th>
                            <th>Date/ Time</th>
                            <th>Rate</th>
                            <th>Pay</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td></td>
                            <td>21/12/08 - 12:00</td>
                            <td>1,000.0000</td>
                            <td>265.4503</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td>21/12/08 - 12:00</td>
                            <td>1,000.0000</td>
                            <td>265.4503</td>    
                        </tr>
                        <tr>
                            <td></td>
                            <td>21/12/08 - 12:00</td>
                            <td>1,000.0000</td>
                            <td>265.4503</td>
                        </tr>
                    </tbody>
                    </table>
            </div>
        </div>
        
    )
}
export default OrderHistories;