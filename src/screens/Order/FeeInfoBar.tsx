import { natives } from 'configure/networkInfo';
import useSelectedCoin from 'hooks/useSelectedCoin';
import { formatNumber } from 'lib';
import { fromBigNumber, toBigInt, toNumber } from 'lib/bigInt';
import { SUPPORTED_NETWORKS } from 'lib/network';
import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { RootState } from 'reducers';
import { toWei } from "web3-utils";

export type FeeInfoBarProps = {
	isBuy: boolean;
	gasPrice: string;
	gasLimit: bigint;
	feeRate: bigint;
	payAmount: string;
	receiveAmount: string;
	isPending: boolean;
	order: () => void;
	getGasLimit: () => Promise<bigint>;
}
const FeeInfoBar:React.FC<FeeInfoBarProps> = ({isBuy, gasPrice, gasLimit, feeRate, payAmount, receiveAmount, isPending, order, getGasLimit}) => {
	const { coinList, symbolMap } = useSelector((state: RootState) => state.coinList);
	const { isReady } = useSelector((state: RootState) => state.app);
    const { networkId } = useSelector((state: RootState) => state.wallet);
	const [{ selectedCoins }] = useSelectedCoin();
	const { destination } = selectedCoins;
	// const [{ payAmount, receiveAmount }] = useOrderAmount();
	const [networkFeePrice, setNetworkFeePrice] = useState(0);
    // const [price, setPrice] = useState(0n);
    const [feePrice, setFeePrice] = useState(0);
	const [nativeIndex, setNativeIndex] = useState(-1);
    const isLaptop = useMediaQuery({ query: `(min-height: 768px)` });


	const getNetworkFeePrice = useCallback(async () => {
        if (nativeIndex === -1 || gasPrice === "0") return;

        try {
            const nativePrice = toBigInt(coinList[nativeIndex].price);
            const gLimit = gasLimit === 0n ? await getGasLimit() : gasLimit;
            const netFeePrice = (gLimit * BigInt(toWei(gasPrice, "gwei")) * nativePrice) / 10n ** 18n;
            // console.debug("feePrice", feePrice, gLimit, gasPrice, nativePrice);
            setNetworkFeePrice(toNumber(netFeePrice));
        } catch (e) {}
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [feePrice, nativeIndex, gasPrice]);

    const getPrice = useCallback(() => {
        if (payAmount === "0") {
            // setPrice(0n);
            setFeePrice(0);
            return;
        }
        try {
            const price = Number(payAmount) * coinList[destination.index].price;
            // console.debug("getPrice", price, "feeRate", feeRate);
            // setPrice(price);
            setFeePrice((price * toNumber(feeRate)));
        } catch (e) {
            // setPrice(0n);
            setFeePrice(0);
        }
    }, [payAmount, feeRate]);

	useEffect(() => {
        if (coinList.length > 0) {
            console.log("symbolMap", symbolMap, natives[networkId])
            const index = symbolMap[`p${natives[networkId]}`];
            index && setNativeIndex(index);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, networkId, coinList.length]);

	useEffect(() => {
        getPrice();
    }, [getPrice]);

    useEffect(() => {
        if (SUPPORTED_NETWORKS[networkId]) {
            getNetworkFeePrice();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getNetworkFeePrice, isReady]);
	
	return (
		<div className="flex flex-col-reverse lg:flex-col">
			<div
				className={`flex gap-3 justify-between flex-row lg:flex-col text-[11px] lg:text-sm ${
					isLaptop && "text-xs "
				}`}
			>
				<div className="hidden lg:flex justify-between w-[40%] lg:w-full">
					<div>Cost</div>
					<div className="font-medium">${payAmount > "0" 
						? formatNumber(
							Number(receiveAmount)/* Number(payAmount) * coinList[idxTarget].price - feePrice * (isBuy?-1:1) */, 18
						)
						: 0}</div>
				</div>
				<div className="flex justify-between w-[40%] lg:w-full">
					<div>Fee</div>
					<div className="flex flex-nowrap items-center">
						<span className="font-medium">${formatNumber(feePrice, 6)}</span>
						<span className="font-light text-[10px] tracking-tighter text-nowrap">
							({fromBigNumber(feeRate * 100n)}%)
						</span>
					</div>
				</div>
				<div className="flex justify-between w-[40%] lg:w-full">
					<span>GAS</span>
					<div className="flex flex-nowrap items-center">
						<span className="font-medium">${formatNumber(networkFeePrice, 5)}</span>
						<span className="font-light text-[10px] tracking-tighter text-nowrap">{`( ${
							Number(gasPrice) < 1 ? Number(gasPrice).toFixed(4) : gasPrice
						} GWEI) `}</span>
					</div>
				</div>
			</div>
			<button
				className={`flex flex-row border-[1px] rounded-md items-center mt-3 lg:mt-6 lg:my-6 mb-4 px-4 py-2 w-full font-medium ${
					isLaptop && "lg:mt-14"
				} hover:bg-gradient-to-l bg-gradient-to-t active:bg-gradient-to-tr ${
					isBuy
						? "from-cyan-450/10 border-cyan-450 text-cyan-450 "
						: "from-red-400/10 border-red-400 text-red-400"
				} to-blue-950`}
				onClick={() => order()}
				disabled={isPending}
			>
				<div className="flex basis-1/3 justify-end pr-2">
					{isPending && (
						<svg
							className={`animate-spin h-5 w-5 ${isBuy ? "text-cyan-450" : "text-red-400"}`}
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							></circle>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
					)}
				</div>
				<span className="basis-1/3 text-lg text-nowrap">{`${isBuy ? "Buy" : "Sell"} ${
					destination.symbol ? destination.symbol : "pBTC"
				}`}</span>
			</button>
		</div>
	)
}

export default FeeInfoBar