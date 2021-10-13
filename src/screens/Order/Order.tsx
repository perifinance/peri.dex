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

const Order = ({openCoinList}) => {
    const dispatch = useDispatch()
    const { isReady } = useSelector((state: RootState) => state.app);
    const { networkId, address } = useSelector((state: RootState) => state.wallet);
    const selectedCoins = useSelector((state: RootState) => state.selectedCoin);
   
    const [coinListType, setCoinListType] = useState(null);
    const [sourceRate, setSourceRate] = useState(0n);
    const [per, setPer] = useState(0n);
    const [exchangeRates, setExchangeRates] = useState(0n);
    const [feeRate, setFeeRate] = useState(0n);
    const [networkFeePrice, setNetworkFeePrice] = useState(0n);
    const [gasPrice, setGasPrice] = useState(0n);
    const [gasLimit, setGasLimit] = useState(0n);
    const [price, setPrice] = useState(0n);
    const [networkRate, setNetworkRate] = useState(0n);
    const [feePrice, setFeePrice] = useState(0n);
    
    const [payAmount, setPayAmount] = useState('0');
    const [payAmountToUSD, setPayAmountToUSD] = useState(0n);
    const [receiveAmount, setReceiveAmount] = useState(0n);
    const [balance, setBalance] = useState(0n);
    const [isValidation, setIsValidation] = useState(true);
    const [validationMessage, setValidationMessage] = useState('');

    const getRate = async () => {
        const [sourceRate, destinationRate] = await Promise.all([getExchangeRates(selectedCoins.source.symbol), getExchangeRates(selectedCoins.destination.symbol)])
        try {
            setSourceRate(sourceRate);
            setExchangeRates(destinationRate * 10n ** 18n / sourceRate);
        }catch (e) {
            console.log(e);
        }
        
    }

    const getFeeRate = async () => {
        setFeeRate(await getFeeRateForExchange(selectedCoins.source.symbol, selectedCoins.destination.symbol));
    }

    const getSourceBalance = async () => {
        setBalance(await getBalance(address, selectedCoins.source.symbol, 18));
    }

    const validationCheck = (value) => {
        try {
            if(isNaN(Number(value))) {
                setIsValidation(false);
                setValidationMessage('Please enter pay input only with numbers')
            } else if(utils.parseEther(value).toBigInt() > balance) {
                setIsValidation(false);
                setValidationMessage('Please enter pay input less than the balance')
            } else {
                setIsValidation(true);
                setValidationMessage('');
            }
        } catch(e) {

        }
        
    }

    const changePayAmount = (value) => {
        validationCheck(value);
        try {
            setPayAmount(value);
            setPayAmountToUSD(utils.parseEther(value).toBigInt() * sourceRate / (10n ** 18n))
            const exchangeAmount = utils.parseEther(value).toBigInt() * 10n ** 18n / exchangeRates;
            const feePrice = exchangeAmount * feeRate / (10n ** 18n);
            setReceiveAmount(exchangeAmount - feePrice);
        }catch(e) {
            console.log(e);
            setPayAmountToUSD(0n);
            setReceiveAmount(0n);
        }  
    }

    const getnetworkFeePrice = () => {
        getGasEstimate();
        const feePrice = (gasLimit * gasPrice) * networkRate;
        setNetworkFeePrice(feePrice);
    }

    const getPrice = () => {
        const price = BigInt(payAmount) * sourceRate ;
        setPrice(price);
        setFeePrice(price * feeRate / (10n ** 18n));
    }

    const getGasEstimate = async () => {
        let gasLimit = 600000n;
        
        try {
            gasLimit = BigInt((await contracts.signers.PeriFinance.estimateGas.exchange(
                utils.formatBytes32String(selectedCoins.source.symbol), 
                utils.parseEther(payAmount),
                utils.formatBytes32String(selectedCoins.destination.symbol))));
        } catch(e) {
            console.log(e);
        }
        setGasLimit(gasLimit);
        return (gasLimit * 12n /10n).toString()
    }

    const order = async () => {
        const transactionSettings = {
            gasPrice: (gasPrice * 10n ** 9n).toString(),
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

    const setNetworkFee = async() => {
        const [fee, rate] = await Promise.all([getNetworkFee(networkId), getNetworkPrice(networkId)]);
        setGasPrice(fee);
        setNetworkRate(rate);
    }

    const setPerAmount = (per) => {
        setPer(per);
        const converPer = per > 0n ? 100n * 10n / per : 0n;
        const perBalance = converPer > 0n ? balance * 10n / converPer : 0n;
        changePayAmount(utils.formatEther(perBalance));
    }

    const convertNumber = (value: bigint) => {
        return value < 10n ? `0${value.toString()}` : value.toString()
    }

    useEffect(() => {
        if(isReady && networkId) {
            getRate();
            getFeeRate();
        }
    },[isReady, networkId, selectedCoins]);

    useEffect(() => {
        if(isReady && networkId) {
            setNetworkFee();
        }
    }, [isReady, networkId])

    useEffect(() => {
        if(isReady && address && networkId) {
            getSourceBalance();
        }
    },[isReady, networkId, address, selectedCoins]);

    
    
    return (
        
        <div className="mb-6 card-width">
            <div className="w-full bg-gray-500 rounded-t-lg px-4 py-2">
                <div className="flex py-2 justify-between w-full">
                    <div>{selectedCoins.destination.symbol} / {selectedCoins.source.symbol}</div>
                    <div>{ formatCurrency(exchangeRates, 2)} (${formatCurrency(exchangeRates * sourceRate / (10n ** 18n), 2)})</div>
                </div>
            </div>
            <div className="w-full bg-gray-700 rounded-b-lg p-4">    
                <div className="flex py-1 justify-between w-full">
                    <div>Pay</div>
                    {isValidation || <div className="flex justify-end font-medium tracking-wide text-red-500 text-xs w-full">    
                        <span>{validationMessage}</span>
                    </div>}
                    <div>Available: {formatCurrency(balance, 4)}</div>
                </div>
                {/* ${isError && 'border border-red-500'} */}
                <div className="flex justify-between items-center rounded-md bg-black text-base">
                    <div className="flex p-3 font-semibold cursor-pointtext-center" onClick={() => openCoinList('source')}>
                        <img className="w-6 h-6" src={`/images/currencies/${selectedCoins.source.symbol}.svg`}></img>
                        <div className="mx-1">{selectedCoins.source.symbol}</div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>    
                    <input className="bg-black pr-3 outline-none" type="text" dir="rtl" value={payAmount} onChange={(e) => changePayAmount(e.target.value)} onBlur={() => {getnetworkFeePrice(); getPrice();}}/>
                </div>
                <div className="flex justify-end font-medium tracking-wide text-xs w-full text-blue-500 px-3 mt-1">
                    <span>${formatCurrency(payAmountToUSD, 2)}</span>
                </div>

                <div className="w-full"><img className="mx-auto w-9 h-9" src={'/images/icon/exchange.svg'}></img></div>

                <div className="py-1 justify-between w-full">
                    <div>Receive(Estimated)</div>
                </div>             
                
                <div className="flex justify-between items-center rounded-md bg-black text-base">
                    <div className="flex p-3 font-semibold cursor-pointtext-center" onClick={() => openCoinList('destination')}>
                        <img className="w-6 h-6" src={`/images/currencies/${selectedCoins.destination.symbol}.svg`}></img>
                        <span className="mx-1">{selectedCoins.destination.symbol}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" onClick={() => openCoinList('destination')}>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    <input className="bg-black pr-3 outline-none" type="text" dir="rtl"  value={formatCurrency(receiveAmount, 18)}/>
                </div>

                <div className="py-2 w-full">
                    <div className="flex justify-between">
                        <input className="cursor-pointer w-full mr-1" type="range" min="1" max="100" value={per.toString()} onChange={(e) => setPerAmount(BigInt(e.target.value))}/>
                        <div className="border border-gray-200 rounded-md text-sm px-1">
                            {convertNumber(per)}%
                        </div>
                    </div>
                    <div className="flex justify-between  text-xs text-gray-400 w-10/12">
                        <span className={`w-8 text-left ${per === 0n && 'text-blue-500'}`} onClick={() => setPerAmount(0n)}>0%</span>
                        <span className={`w-8 text-center ${per === 25n && 'text-blue-500'}`} onClick={() => setPerAmount(25n)}>25%</span>
                        <span className={`w-8 text-center ${per === 50n && 'text-blue-500'}`} onClick={() => setPerAmount(50n)}>50%</span>
                        <span className={`w-8 text-center ${per === 75n && 'text-blue-500'}`} onClick={() => setPerAmount(75n)}>75%</span>
                        <span className={`w-8 text-right ${per === 100n && 'text-blue-500'}`} onClick={() => setPerAmount(100n)}>100%</span>
                    </div>
                </div>
                <div className="pt-4">
                    <div className="flex py-2 justify-between w-full">
                        <div>Network Fee({gasPrice.toString()}GWEI)</div>
                        <div>${formatCurrency(networkFeePrice, 4)}</div>
                    </div>

                    <div className="flex py-2 justify-between w-full">
                        <div>Cost: </div>
                        <div>${formatCurrency(price-feePrice, 18)}</div>
                    </div>

                    <div className="flex py-2 justify-between w-full">
                        <div>Fee({utils.formatEther(feeRate)}%)</div>
                        <div>${formatCurrency(feePrice, 18)}</div>
                    </div>
                </div>
                <button className="bg-blue-500 my-6 px-4 py-2 w-full rounded-lg text-center text-white text-2xl" onClick={ () => order()}>
                    Confirm
                </button>
                
            </div>
        </div>
    )
}
export default Order;