import React, { useCallback, useEffect, useState } from 'react'
import { useMediaQuery } from 'react-responsive';
import { TokenInput } from 'components/TokenInput'
import { fromBigNumber, toBigInt, toNumber } from 'lib/bigInt';
import { RangeInput } from 'components/RangeInput';
import useSelectedCoin from 'hooks/useSelectedCoin';
import { RootState } from 'reducers';
import { useSelector } from 'react-redux';
import { set } from 'date-fns';

type InputPenalProps = {
	isBuy: boolean;
	balance: [bigint, bigint];
	feeRate: bigint;
	payAmount: string;
	receiveAmount: string;
	setPayAmount: (value: string) => void;
	setReceiveAmount: (value: string) => void;
	validationCheck: (value: string) => void;
}

const InputPenal: React.FC<InputPenalProps> = ({isBuy, balance, feeRate, payAmount, receiveAmount, setPayAmount, setReceiveAmount, validationCheck}) => {
	const { isReady } = useSelector((state: RootState) => state.app);
    const { networkId, address, isConnect } = useSelector((state: RootState) => state.wallet);
	const { coinList } = useSelector((state: RootState) => state.coinList);
    const [{ selectedCoins }] = useSelectedCoin();
    const { source, destination } = selectedCoins;
	// const [{ payAmount, receiveAmount }, setPayAmount, setReceiveAmount] = useOrderAmount();
	const [per, setPer] = useState(0n);
    const [isPayCoin, setIsPayCoin] = useState(false);
    const [inputAmt, setInputAmt] = useState<string | number>("");
	const [idxTarget, setIdxTarget] = useState(destination.index);
    // const [payAmount, setPayAmount] = useState("");
    // const [receiveAmount, setReceiveAmount] = useState("");
	const isLaptop = useMediaQuery({ query: `(min-height: 768px)` });

    const changePayAmount = useCallback(
        (amount: number | string, isPay: boolean=!isBuy) => {
            try {
                amount = amount === "." ? "0." : amount;
                const receiveAmtNoFee =
                    isPay === isBuy
                        ? (toBigInt(amount) * 10n ** 18n) / toBigInt(coinList[idxTarget].price)
                        : (toBigInt(amount) * toBigInt(coinList[idxTarget].price)) / 10n ** 18n;

                // console.log("changePayAmount", amount, receiveAmtNoFee, coinList[idxTarget]);
                const feePrice = (receiveAmtNoFee * feeRate) / 10n ** 18n;

                const calcAmt = receiveAmtNoFee + feePrice * (isPay ? -1n : 1n);
                const payAmount = isPay ? amount.toString() : fromBigNumber(calcAmt);
                const receiveAmount = isPay ? fromBigNumber(calcAmt) : amount.toString();

                validationCheck(payAmount);

                // console.debug("changePayAmount", amount, payAmount, feePrice, receiveAmount);
                setPayAmount(payAmount);
                setReceiveAmount(receiveAmount);
                setIsPayCoin(isPay);
                setInputAmt(amount);
            } catch (e) {
                // setPayAmountToUSD(0n);
                isBuy ? setReceiveAmount("") : setPayAmount("");
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [feeRate, coinList[idxTarget]]
    );

    const changeAmountByPay = (value) => changePayAmount(value, true);
    const changeAmountByBuy = (value) => changePayAmount(value, false);
	
    const setPerAmount = (per) => {
        console.debug("per", per);

        const selBalance = balance.length ? balance[isBuy ? 0 : 1] : 0n;

        setPer(per);
        const convertPer = per > 0n ? (100n * 10n) / per : 0n;
        const perBalance = convertPer > 0n ? (selBalance * 10n) / convertPer : 0n;
        changePayAmount(fromBigNumber(perBalance), true);
    };

    useEffect(() => {
        if (Number(inputAmt) !== 0) changePayAmount(inputAmt, isPayCoin);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [changePayAmount]);

	useEffect(() => {
        if (isReady && isConnect && address) {
            setPayAmount("");
            setReceiveAmount("");
			setInputAmt("");
            setPer(0n);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, networkId, address, isBuy]);

	useEffect(() => {
		setIdxTarget(destination.index);
	}, [destination.index]);

	return (
		<div className="flex flex-col w-full mt-2 lg:mt-3 space-y-1 lg:space-y-2">
			<TokenInput 
				symbol={destination.symbol} 
				amount={isBuy ? receiveAmount : payAmount} 
				balance={toNumber(balance[1])} caption={isBuy ? "Buy Amount" : "Sell Amount"}
				borderColor={isBuy ? "border-cyan-950" : "border-red-950"} 
				setInputAmt={setInputAmt} 
				changePayAmount={isBuy ? changeAmountByBuy : changeAmountByPay} 
			/>
			<TokenInput 
				symbol={source.symbol} 
				amount={isBuy ? payAmount : receiveAmount} 
				balance={toNumber(balance[0])} caption={isBuy ? "Pay Amount" : "Receive Amount"}
				borderColor={isBuy ? "border-cyan-950" : "border-red-950"} 
				setInputAmt={setInputAmt} 
				changePayAmount={isBuy ? changeAmountByPay: changeAmountByBuy} 
			/>
			<div className={`${isLaptop && "lg:my-3"}`}>
				<RangeInput
					per={per}
					setPerAmount={setPerAmount}
					divide={4}
					bgColor={isBuy ? "bg-cyan-450" : "bg-red-400"}
					color={isBuy ? "text-cyan-450" : "text-red-400"}
				/>
			</div>
		</div> 
	)
}


export default InputPenal