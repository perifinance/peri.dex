import { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'reducers';
import { getLastRates, getBalances } from 'lib/thegraph/api'
import { getFeeRateForExchange } from 'lib/rates'
import { contracts } from 'lib';
import { utils } from 'ethers';
import { formatCurrency } from 'lib'
import { updateTransaction } from 'reducers/transaction'
import { getNetworkFee } from 'lib/fee'
import { getNetworkPrice } from 'lib/price';
import { setSourceCoin, setDestinationCoin } from 'reducers/coin/selectedCoin'

const Order = ({openCoinList}) => {
    const dispatch = useDispatch()
    const { isReady } = useSelector((state: RootState) => state.app);
    const { networkId, address, isConnect } = useSelector((state: RootState) => state.wallet);
    const selectedCoins = useSelector((state: RootState) => state.selectedCoin);
   
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
    const [rate, setRate] = useState(0n);

    const getRate = useCallback(async () => {
        const rates = await (async() => {
            const rates = await Promise.all(
                [
                    getLastRates({currencyName: selectedCoins.source.symbol}), 
                    getLastRates({currencyName: selectedCoins.destination.symbol})
                ]);
                
            return Object.assign(...rates);
        })()
        const sourceRate = rates[selectedCoins.source.symbol]
        const destinationRate = rates[selectedCoins.destination.symbol]
        
        try {
            const exchangeRates = destinationRate * 10n ** 18n / sourceRate;
            setSourceRate(sourceRate);
            setExchangeRates(exchangeRates);
            setRate( 10n ** 18n * 10n ** 18n / (exchangeRates));
        }catch (e) {
            console.log(e);
        }
    }, [selectedCoins])

    const getFeeRate = async () => {
        try {
            setFeeRate(await getFeeRateForExchange(selectedCoins.source.symbol, selectedCoins.destination.symbol));
        } catch (e) {

        }
    }

    const getSourceBalance = async () => {
        const balance = await getBalances({address, currencyName: selectedCoins.source.symbol});

        setBalance(balance?.amount || 0n);
    }

    const validationCheck = (value) => {
        try {
            if(isNaN(Number(value))) {
                setIsValidation(false);
                setValidationMessage('Please enter pay input only with numbers')
            } else if(utils.parseEther(value).toBigInt() > balance) {
                setIsValidation(false);
                setValidationMessage('Not Greater Than Balance')
            } else {
                setIsValidation(true);
                setValidationMessage('');
            }
        } catch(e) {

        }
        
    }

    const changePayAmount = (value) => {
        validationCheck(value);
        setPayAmount(value);
        try {
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

    const getPrice = useCallback( () => {
        try {
            const price = BigInt(utils.parseEther(payAmount).toString()) * sourceRate / 10n ** 18n;
            setPrice(price);
            setFeePrice(price * feeRate / (10n ** 18n));
        } catch(e) {
            setPrice(0n);
            setFeePrice(0n);
        }
    }, [payAmount, sourceRate, feeRate, setPrice, setFeePrice])

    const getGasEstimate = async () => {
        let gasLimit = 600000n;
        
        try {
            gasLimit = BigInt((await contracts.signers.PeriFinance.estimateGas.exchange(
                utils.formatBytes32String(selectedCoins.source.symbol), 
                utils.parseEther(payAmount === '0' ? '1' : payAmount),
                utils.formatBytes32String(selectedCoins.destination.symbol))));
        } catch(e) {
            
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
            console.log(utils.parseEther(payAmount).toString());
            transaction = await contracts.signers.PeriFinance.exchange(
                utils.formatBytes32String(selectedCoins.source.symbol), 
                utils.parseEther(payAmount),
                utils.formatBytes32String(selectedCoins.destination.symbol),
                transactionSettings
            );

            dispatch(updateTransaction(
                {
                    hash: transaction.hash,
                    message: `Buy ${selectedCoins.destination.symbol} from ${selectedCoins.source.symbol}`,
                    type: 'Exchange'
                }
            ));
            
            
        } catch(e) {
            console.log(e);
        }  
    }

    const swapToCurrency = () => {
        const {source, destination} = Object.assign({}, selectedCoins);
        dispatch(setSourceCoin(destination));
        dispatch(setDestinationCoin(source));
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
        if(selectedCoins.source.symbol && selectedCoins.destination.symbol) {
            getRate();
            const timeout = setInterval(() => {
                getRate();
            }, 1000 * 60);
            return () => clearInterval(timeout)
        }
    }, [selectedCoins])

    useEffect(() => {
        if(isReady && networkId) {
            getFeeRate();
            getnetworkFeePrice();
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

    useEffect(() => {
        getPrice();
    },[receiveAmount, getPrice])
    
    useEffect(() => {
        if(!isConnect || selectedCoins) {
            setPayAmount('0');
            setPayAmountToUSD(0n);
            setReceiveAmount(0n);
            setBalance(0n);
            setIsValidation(true);
            setValidationMessage('');
            setPer(0n);
        }
    },[isConnect, selectedCoins])
    
    return (
        
        <div className="mb-6 card-width">
            <div className="w-full bg-gray-500 rounded-t-lg px-4 py-2">
                <div className="flex space-x-8 py-2">
                    <div className="relative">
                        <img className="w-10 h-10" src={`/images/currencies/${selectedCoins.destination.symbol}.svg`}></img>
                        <img className="w-10 h-10 absolute bottom-0 left-6" src={`/images/currencies/${selectedCoins.source.symbol}.svg`}></img>
                    </div>
                    <div className="text-xl">{selectedCoins.destination.symbol} / {selectedCoins.source.symbol}</div>
                    
                </div>
            </div>
            <div className="w-full bg-gray-700 rounded-b-lg p-4">    
                <div className="flex py-1 justify-between w-full">
                    <div>Pay</div>
                    {!isValidation ? <div className="flex justify-end font-medium tracking-wide text-red-500 text-xs w-full">    
                        <span>{validationMessage}</span>
                    </div> : <div>Available: {formatCurrency(balance, 4)}</div>}
                </div>
                {/* ${isError && 'border border-red-500'} */}
                <div className="flex items-center rounded-md bg-black text-base">
                    <div className="flex p-3 font-semibold cursor-pointer" onClick={() => openCoinList('source')}>
                        <img className="w-6 h-6" src={`/images/currencies/${selectedCoins.source.symbol}.svg`}></img>
                        <div className="mx-1">{selectedCoins.source.symbol}</div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>    
                    <input className="bg-black pr-3 outline-none text-right" type="text" value={payAmount} onChange={(e) => changePayAmount(e.target.value)}/>
                </div>
                <div className="flex justify-end font-medium tracking-wide text-xs w-full text-blue-500 px-3 mt-1">
                    <span>${formatCurrency(payAmountToUSD, 2)}</span>
                </div>

                <div className="w-full"><img className="mx-auto w-9 h-9 cursor-pointer" src={'/images/icon/exchange.svg'} onClick={() => swapToCurrency()}></img></div>

                <div className="py-1 justify-between w-full">
                    <div>Receive(Estimated)</div>
                </div>             
                
                <div className="flex items-center rounded-md bg-black text-base">
                    <div className="flex p-3 font-semibold cursor-pointer" onClick={() => openCoinList('destination')}>
                        <img className="w-6 h-6" src={`/images/currencies/${selectedCoins.destination.symbol}.svg`}></img>
                        <span className="mx-1">{selectedCoins.destination.symbol}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" onClick={() => openCoinList('destination')}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    <input className="bg-black pr-3 outline-none text-right" type="text" value={formatCurrency(receiveAmount, 18)} disabled/>
                </div>

                <div className="py-2 w-full">
                    <div className="flex justify-between">
                        <input className="cursor-pointer w-full mr-1" type="range" min="0" max="100" value={per.toString()} onChange={(e) => setPerAmount(BigInt(e.target.value))}/>
                        <div className="border border-gray-200 rounded-md text-sm px-1">
                            {convertNumber(per)}%
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 w-10/12">
                        <span className={`w-8 text-left cursor-pointer ${per === 0n && 'text-blue-500'}`} onClick={() => setPerAmount(0n)}>0%</span>
                        <span className={`w-8 text-center cursor-pointer ${per === 25n && 'text-blue-500'}`} onClick={() => setPerAmount(25n)}>25%</span>
                        <span className={`w-8 text-center cursor-pointer ${per === 50n && 'text-blue-500'}`} onClick={() => setPerAmount(50n)}>50%</span>
                        <span className={`w-8 text-center cursor-pointer ${per === 75n && 'text-blue-500'}`} onClick={() => setPerAmount(75n)}>75%</span>
                        <span className={`w-8 text-right cursor-pointer ${per === 100n && 'text-blue-500'}`} onClick={() => setPerAmount(100n)}>100%</span>
                    </div>
                </div>
                <div className="pt-4">
                    <div className="flex py-2 justify-between w-full">
                        <div>Network Fee({gasPrice.toString()}GWEI)</div>
                        <div>${formatCurrency(networkFeePrice, 4)}</div>
                    </div>
                    <div className="flex py-2 justify-between w-full">
                        <div>rate</div>
                        <div>1 {selectedCoins.source.symbol} = {formatCurrency(rate, 8)} {selectedCoins.destination.symbol}</div>
                    </div>
                    
                    {BigInt(receiveAmount) > 0n && isValidation && <> 
                        <div className="flex py-2 justify-between w-full">
                            <div>Cost: </div>
                            <div>${formatCurrency(price-feePrice, 18)}</div>
                        </div>

                        <div className="flex py-2 justify-between w-full">
                            <div>Fee({utils.formatEther(feeRate)}%)</div>
                            <div>${formatCurrency(feePrice, 18)}</div>
                        </div>
                    </>}
                    
                    
                </div>
                <button className="bg-blue-500 my-6 px-4 py-2 w-full rounded-lg text-center text-white text-2xl" onClick={ () => order()}>
                    Confirm
                </button>
                
            </div>
        </div>
    )
}
export default Order;