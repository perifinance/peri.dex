import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'reducers';
import { getExchangeRates, getFeeRateForExchange } from 'lib/rates'
import { getBalance } from 'lib/balance'
import { contracts } from 'lib';
import { utils } from 'ethers';
import { formatCurrency } from 'lib'
import { updateTransaction } from 'reducers/transaction'
const Order = ({openCoinList}) => {
    const dispatch = useDispatch()
    const { isReady } = useSelector((state: RootState) => state.app);
    const { networkId, address } = useSelector((state: RootState) => state.wallet);
    const selectedCoins = useSelector((state: RootState) => state.selectedCoin);
   
    const [coinListType, setCoinListType] = useState(null);
    const [per, setPer] = useState(0);
    const [exchageRates, setExchageRates] = useState(0n);
    const [fee, setFee] = useState(0n);
    const [payAmount, setPayAmount] = useState('0');
    const [receiveAmount, setReceiveAmount] = useState('0');

    const [available, setAvailable] = useState(0n);
    const [balance, setBalance] = useState(0n);

    const getRate = async () => {
        const [sourceRate, destinationRate] = await Promise.all([getExchangeRates(selectedCoins.source.symbol), getExchangeRates(selectedCoins.destination.symbol)])
        setExchageRates(destinationRate * 10n ** 18n / sourceRate);
    }

    const getFeeRate = async () => {
        setFee(await getFeeRateForExchange(selectedCoins.source.symbol, selectedCoins.destination.symbol));
    }

    const getSourceBalance = async () => {
        setBalance(await getBalance(address, selectedCoins.source.symbol, 18));
    }

    const changePayAmount = (value) => {
        try {
            setPayAmount(value);
            setReceiveAmount((BigInt(value) * 10n ** 18n * 10n ** 18n / exchageRates).toString());
        }catch(e) {
            console.log(exchageRates);
            console.log(e);
        }  
    }

    const getGasEstimate = async () => {
        let gasLimit = 600000n;
        
        try {
            gasLimit = BigInt((await contracts.signers.PeriFinance.estimateGas.exchange(
                utils.formatBytes32String(selectedCoins.source.symbol), 
                utils.parseEther(payAmount),
                utils.formatBytes32String(selectedCoins.destination.symbol))).toString());
        } catch(e) {
            console.log(e);
        }
        
        return (gasLimit * 12n /10n).toString()
    }

    const order = async () => {
        const transactionSettings = {
            gasPrice: (80n * 10n ** 18n).toString(),
            gasLimit: await getGasEstimate(),
        }
        
        try {
            let transaction;
            transaction = await contracts.signers.PeriFinance.exchange(
                utils.formatBytes32String(selectedCoins.source.symbol), 
                utils.parseEther(payAmount),
                utils.formatBytes32String(selectedCoins.destination.symbol),
                transactionSettings
            );
            
            dispatch(updateTransaction(
                {
                    hash: transaction.hash,
                    message: `매수`,
                    type: 'Staked & Minted'
                }
            ));
        } catch(e) {
            console.log(e);
        }  
    }

    useEffect(() => {
        if(isReady && networkId) {
            getRate();
            getFeeRate();
        }
    },[isReady, networkId, selectedCoins])

    useEffect(() => {
        if(isReady && address && networkId) {
            getSourceBalance();
        }
    },[isReady, networkId, address, selectedCoins])
    
    return (
        <div className="max-w-sm h-screen">
            <div className="flex py-2 justify-between w-full">
                <div className="text-gray-200">Pay</div>
                <div className="text-gray-200">Available: {formatCurrency(balance, 18)}</div>
            </div>
            <div className="flex items-center py-2 space-x-6 rounded-xl">
                <div className="flex py-3 rounded-lg text-gray-200 font-semibold cursor-pointtext-center m-auto" onClick={() => openCoinList('source')}>
                    <span>{selectedCoins.source.symbol}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>    
                
                <div className="flex bg-gray-100 py-2 w-full rounded-lg ${isError && 'border border-red-500'}">
                    <input className="bg-gray-100 w-full outline-none" type="text" value={payAmount} onChange={(e) => changePayAmount(e.target.value)}/>
                </div>
            </div>
            <div className="flex justify-end font-medium tracking-wide text-red-500 text-xs w-full">    
                <span>Invalid username field !</span>
            </div>

            
            <div className="flex py-2 justify-between w-full">
                <div className="text-gray-200">Receive(Estimated)</div>
            </div>
            
            <div className="flex items-center py-2 space-x-6 rounded-xl">
                <div className="flex py-3 rounded-lg text-gray-200 font-semibold cursor-pointtext-center m-auto">
                    <span>{selectedCoins.destination.symbol}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" onClick={() => openCoinList('destination')}>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
                <div className="flex bg-gray-200 py-2 w-full rounded-lg">
                    <input className="bg-gray-200 w-full outline-none" type="text" value={formatCurrency(receiveAmount, 18)}/>
                </div>
            </div>

            <div className="py-2 w-full">
                <div className="bg-gray-300 h-2 w-full rounded-full relative">
                    <span className="bg-white h-4 w-4 absolute top-0 -ml-2 -mt-1 z-10 shadow rounded-full cursor-pointer" style={{left: `${per}%`}}></span>
                    <span className="bg-blue-500 h-2 absolute left-0 top-0 rounded-full" style={{width: `${per}%`}}></span>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span className="w-8 text-left" onClick={() => setPer(0)}>0%</span>
                    <span className="w-8 text-center" onClick={() => setPer(25)}>25%</span>
                    <span className="w-8 text-center" onClick={() => setPer(50)}>50%</span>
                    <span className="w-8 text-center" onClick={() => setPer(75)}>75%</span>
                    <span className="w-8 text-right" onClick={() => setPer(100)}>100%</span>
                </div>
            </div>

            

            <div className="flex py-2 justify-between w-full">
                <div className="text-gray-200">Network Fee(40GWEI)</div>
                <div className="text-gray-200">$0.01</div>
            </div>

            <div className="flex py-2 justify-between w-full">
                <div className="text-gray-200">Price: </div>
                <div className="text-gray-200">${BigInt(400000).toLocaleString()}</div>
            </div>

            <div className="flex py-2 justify-between w-full">
                <div className="text-gray-200">Received:</div>
                <div className="text-gray-200">{BigInt(400000).toLocaleString()}BTC</div>
            </div>

            <div className="flex py-2 justify-between w-full">
                <div className="text-gray-200">Fee(0.03%:)</div>
                <div className="text-gray-200">${BigInt(20).toLocaleString()}</div>
            </div>

            <div className="flex py-2 justify-between w-full">
                <div className="text-gray-200">Total:</div>
                <div className="text-gray-200">${BigInt(400020).toLocaleString()}</div>
            </div>

            <div className="p-6 space-x-6 rounded-xl">
                <button className="bg-blue-400 p-4 w-full rounded-lg text-center text-white" onClick={ () => order()}>
                    Confirm
                </button>
            </div>
            
        </div>
    )
}
export default Order;