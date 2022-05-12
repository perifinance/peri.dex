import React, { useEffect, useState } from 'react';
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
import OrderHistories from 'screens/OrderHistories'
import Chart from 'screens/Chart'
const Order = ({openCoinList}) => {
  const dispatch = useDispatch()
  const { isReady } = useSelector((state: RootState) => state.app);
  const { networkId, address } = useSelector((state: RootState) => state.wallet);
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
  const [leverage, setLeverage] = useState(1n);
  const [isValidation, setIsValidation] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');

  const getRate = async () => {
    const [sourceRate, destinationRate] = await Promise.all([getExchangeRates(selectedCoins.source.symbol), getExchangeRates(selectedCoins.destination.symbol)])
    setSourceRate(sourceRate);
    setExchangeRates(destinationRate * 10n ** 18n / sourceRate);
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

  const getNetworkFeePrice = () => {
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
      
      // dispatch(updateTransaction(
      //   {
      //     hash: transaction.hash,
      //     message: `매수`,
      //     type: 'Staked & Minted'
      //   }
      // ));
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
    const convertPer = per > 0n ? 100n * 10n / per : 0n;
    const perBalance = convertPer > 0n ? balance * 10n / convertPer : 0n;
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
  },[isReady, networkId, selectedCoins, getFeeRate, getRate]);

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
    <div className="max-w-sm">
      <div className="w-full bg-gray-600 rounded-t-lg px-4 py-2">
        <div className="flex py-2 justify-between w-full">
          <div className="text-gray-200">{selectedCoins.destination.symbol} / {selectedCoins.source.symbol}</div>
          <div className="text-gray-200">{ formatCurrency(exchangeRates, 2)} (${formatCurrency(exchangeRates * sourceRate / (10n ** 18n), 2)})</div>
        </div>
      </div>
      <div className="w-full bg-gray-800 rounded-b-lg p-4">  
        <div className="flex py-2 justify-between w-full">
          <div className="text-gray-200">Pay</div>
          <div className="text-gray-200">Available: {formatCurrency(balance, 18)}</div>
        </div>
        <div className="flex items-center space-x-6 rounded-xl">
          <div className="flex py-3 rounded-lg text-gray-200 font-semibold cursor-pointtext-center m-auto" onClick={() => openCoinList('source')}>
            <span>{selectedCoins.source.symbol}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>  
          
          <div className="flex bg-gray-100 py-2 w-full rounded-lg ${isError && 'border border-red-500'}">
            <input className="bg-gray-100 w-full outline-none" type="text" value={payAmount} onChange={(e) => changePayAmount(e.target.value)} onBlur={() => {getNetworkFeePrice(); getPrice();}}/>
          </div>
        </div>
        <div className="flex justify-end font-medium tracking-wide text-gray-200 text-xs w-full">  
          <span>${formatCurrency(payAmountToUSD, 2)}</span>
        </div>
        {isValidation || <div className="flex justify-end font-medium tracking-wide text-red-500 text-xs w-full">  
          <span>{validationMessage}</span>
        </div>}
        

        
        <div className="flex py-2 justify-between w-full">
          <div className="text-gray-200">Receive(Estimated)</div>
        </div>
        
        <div className="flex items-center py-2 space-x-6 rounded-xl">
          <div className="flex py-3 rounded-lg text-gray-200 font-semibold cursor-pointtext-center m-auto">
            <span>{selectedCoins.destination.symbol}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" onClick={() => openCoinList('destination')}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="flex bg-gray-200 py-2 w-full rounded-lg">
            <input className="bg-gray-200 w-full outline-none" type="text" value={formatCurrency(receiveAmount, 18)}/>
          </div>
        </div>

        <div className="py-2 w-full">
          <div className="flex justify-between">
            <input className="cursor-pointer w-10/12" type="range" min="1" max="100" value={per.toString()} onChange={(e) => setPerAmount(BigInt(e.target.value))}/>
            <div className="w-10">
              <label className="text-gray-200 border border-gray-200 rounded-md text-sm px-1">{convertNumber(per)}%</label>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400 w-10/12">
            <span className="w-8 text-left" onClick={() => setPerAmount(0n)}>0%</span>
            <span className="w-8 text-center" onClick={() => setPerAmount(25n)}>25%</span>
            <span className="w-8 text-center" onClick={() => setPerAmount(50n)}>50%</span>
            <span className="w-8 text-center" onClick={() => setPerAmount(75n)}>75%</span>
            <span className="w-8 text-right" onClick={() => setPerAmount(100n)}>100%</span>
          </div>
        </div>

        <div className="py-2 w-full">
          <div className="flex justify-between">
            <input className="cursor-pointer w-10/12" type="range" min="1" max="20" value={leverage.toString()} onChange={(e) => setLeverage(BigInt(e.target.value))}/>
            <div className="w-10">
              <label className="text-gray-200 border border-gray-200 rounded-md text-sm px-1">X{convertNumber(leverage)}</label>
            </div>
          </div>
        </div>

        <div className="flex py-2 justify-between w-full">
          <div className="text-gray-200">Network Fee({gasPrice.toString()}GWEI)</div>
          <div className="text-gray-200">${formatCurrency(networkFeePrice, 4)}</div>
        </div>

        <div className="flex py-2 justify-between w-full">
          <div className="text-gray-200">Cost: </div>
          <div className="text-gray-200">${formatCurrency(price-feePrice, 18)}</div>
        </div>

        <div className="flex py-2 justify-between w-full">
          <div className="text-gray-200">Fee({utils.formatEther(feeRate)}%)</div>
          <div className="text-gray-200">${formatCurrency(feePrice, 18)}</div>
        </div>

        <div className="p-6 space-x-6 rounded-xl">
          <button className="bg-blue-400 p-4 w-full rounded-lg text-center text-white" onClick={ () => order()}>
            Confirm
          </button>
        </div>
      </div>
      <Chart/>
      <OrderHistories/>
    </div>
  )
}
export default Order;