import { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "reducers";
import { getLastRates, getBalances } from "lib/thegraph/api";
import { getFeeRateForExchange } from "lib/rates";
import { contracts } from "lib";
import { utils } from "ethers";
import { formatCurrency } from "lib";
import { updateTransaction } from "reducers/transaction";
import { getNetworkFee } from "lib/fee";
import { getNetworkPrice } from "lib/price";
import { setSourceCoin, setDestinationCoin } from "reducers/coin/selectedCoin";
import { changeNetwork } from "lib/network";
import { NotificationManager } from "react-notifications";
import { setLoading } from "reducers/loading";

const Order = ({ openCoinList }) => {
	const dispatch = useDispatch();
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

	const [payAmount, setPayAmount] = useState("0");
	const [payAmountToUSD, setPayAmountToUSD] = useState(0n);
	const [receiveAmount, setReceiveAmount] = useState(0n);
	const [balance, setBalance] = useState(0n);
	const [isValidation, setIsValidation] = useState(false);
	const [validationMessage, setValidationMessage] = useState("");

	const getRate = useCallback(async () => {
		try {
			const rates = await (async () => {
				const rates = await Promise.all([
					getLastRates({ currencyName: selectedCoins.source.symbol }),
					getLastRates({ currencyName: selectedCoins.destination.symbol }),
				]);

				return rates;
			})();

			const sourceRate = rates[0];
			const destinationRate = rates[1];
			const exchangeRates = (destinationRate * 10n ** 18n) / sourceRate;

			setSourceRate(sourceRate);
			setExchangeRates(exchangeRates);
		} catch (e) {
			console.error("getRate error", e);
		}
	}, [selectedCoins]);

	const getFeeRate = async () => {
		try {
			setFeeRate(await getFeeRateForExchange(selectedCoins.source.symbol, selectedCoins.destination.symbol));
		} catch (e) {}
	};

	const getSourceBalance = async () => {
		const balance: any = await getBalances({
			address,
			networkId,
			currencyName: selectedCoins.source.symbol ?? "pUSD",
		});

		setBalance(balance || 0n);
	};

	const validationCheck = (value) => {
		try {
			if (Number(value) === 0) {
				setIsValidation(false);
				setValidationMessage("Enter an amount to see more trading details.");
			} else if (isNaN(Number(value))) {
				setIsValidation(false);
				setValidationMessage("Please enter pay input only with numbers");
			} else if (utils.parseEther(value).toBigInt() > balance) {
				setIsValidation(false);
				setValidationMessage("Insufficient balance");
			} else if (selectedCoins.source.symbol === selectedCoins.destination.symbol) {
				setIsValidation(false);
				setValidationMessage("Cannot convert to same currency");
			} else {
				setIsValidation(true);
				setValidationMessage("");
			}
		} catch (e) {
			console.log(e);
			setIsValidation(true);
			setValidationMessage("");
		}
	};

	const changePayAmount = (value) => {
		validationCheck(value);
		setPayAmount(value);
		try {
			setPayAmountToUSD((utils.parseEther(value).toBigInt() * sourceRate) / 10n ** 18n);
			const exchangeAmount = (utils.parseEther(value).toBigInt() * 10n ** 18n) / exchangeRates;
			const feePrice = (exchangeAmount * feeRate) / 10n ** 18n;
			setReceiveAmount(exchangeAmount - feePrice);
		} catch (e) {
			setPayAmountToUSD(0n);
			setReceiveAmount(0n);
		}
	};

	const getNetworkFeePrice = () => {
		try {
			getGasEstimate().then(() => {
				const feePrice = gasLimit * gasPrice * networkRate;
				setNetworkFeePrice(feePrice / 10n ** 9n);
			});
		} catch (e) {}
	};

	const getPrice = useCallback(() => {
		try {
			const price = (BigInt(utils.parseEther(payAmount).toString()) * sourceRate) / 10n ** 18n;
			setPrice(price);
			setFeePrice((price * feeRate) / 10n ** 18n);
		} catch (e) {
			setPrice(0n);
			setFeePrice(0n);
		}
	}, [payAmount, sourceRate, feeRate, setPrice, setFeePrice]);

	const getGasEstimate = async () => {
		let gasLimit = 600000n;

		try {
			gasLimit = BigInt(
				await contracts.signers.PeriFinance.estimateGas.exchange(
					utils.formatBytes32String(selectedCoins.source.symbol),
					utils.parseEther(payAmount === "0" ? "1" : payAmount),
					utils.formatBytes32String(selectedCoins.destination.symbol)
				)
			);
		} catch (e) {}
		setGasLimit(gasLimit);
		return ((gasLimit * 12n) / 10n).toString();
	};

	const order = async () => {
		dispatch(setLoading({ name: "balance", value: true }));

		if (networkId !== Number(process.env.REACT_APP_DEFAULT_NETWORK_ID)) {
			// NotificationManager.warning(
			// 	`This network is not supported. Please change to moonriver network`,
			// 	"ERROR"
			// );
			// changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID);
			return false;
		}

		const transactionSettings = {
			gasPrice: (gasPrice * 10n ** 9n).toString(),
			gasLimit: await getGasEstimate(),
		};

		try {
			let transaction;
			transaction = await contracts.signers.PeriFinance.exchange(
				utils.formatBytes32String(selectedCoins.source.symbol),
				utils.parseEther(payAmount),
				utils.formatBytes32String(selectedCoins.destination.symbol),
				transactionSettings
			);

			dispatch(
				updateTransaction({
					hash: transaction.hash,
					message: `Buy ${selectedCoins.destination.symbol} from ${selectedCoins.source.symbol}`,
					type: "Exchange",
					action: () => {
						getSourceBalance();
						setPayAmount("0");
						validationCheck("0");
						setPer(0n);
						setPayAmountToUSD(0n);
						setReceiveAmount(0n);
					},
				})
			);

			dispatch(setLoading({ name: "balance", value: false }));
		} catch (e) {
			console.log(e);
		}
		dispatch(setLoading({ name: "balance", value: false }));
	};

	const swapToCurrency = () => {
		if (networkId !== Number(process.env.REACT_APP_DEFAULT_NETWORK_ID)) {
			// NotificationManager.warning(`This network is not supported. Please change to moonriver network`, "ERROR");
			// changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID);
			return false;
		}
		const { source, destination } = Object.assign({}, selectedCoins);
		dispatch(setSourceCoin(destination));
		dispatch(setDestinationCoin(source));
	};

	const setNetworkFee = async () => {
		try {
			const [fee, rate] = await Promise.all([getNetworkFee(networkId), getNetworkPrice(networkId)]);
			setGasPrice(fee);
			setNetworkRate(rate);
			return rate;
		} catch (e) {}
	};

	const setPerAmount = (per) => {
		setPer(per);
		const convertPer = per > 0n ? (100n * 10n) / per : 0n;
		const perBalance = convertPer > 0n ? (balance * 10n) / convertPer : 0n;
		changePayAmount(utils.formatEther(perBalance));
	};

	const convertNumber = (value: bigint) => {
		return value < 10n ? `0${value.toString()}` : value.toString();
	};

	useEffect(() => {
		if (selectedCoins.source.symbol && selectedCoins.destination.symbol) {
			getRate();
			const timeout = setInterval(() => {
				getRate();
			}, 1000 * 60);
			return () => clearInterval(timeout);
		}
	}, [selectedCoins]);

	useEffect(() => {
		dispatch(setLoading({ name: "balance", value: true }));

		if (isReady && networkId) {
			setNetworkFee();
		}

		dispatch(setLoading({ name: "balance", value: false }));
	}, [isReady, networkId, selectedCoins]);

	useEffect(() => {
		if (isReady && networkId) {
			getFeeRate();
			getNetworkFeePrice();
		}
	}, [isReady, networkId, gasLimit, gasPrice, networkRate]);

	useEffect(() => {
		if (isReady && isConnect && address) {
			if (networkId === Number(process.env.REACT_APP_DEFAULT_NETWORK_ID)) {
				getSourceBalance();
			} else {
				// changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID);
				setPayAmount("0");
				validationCheck("0");
				setPayAmountToUSD(0n);
				setReceiveAmount(0n);
				setBalance(0n);
				setPer(0n);
			}
		}
	}, [isReady, networkId, isConnect, address, selectedCoins]);

	useEffect(() => {
		getPrice();
	}, [receiveAmount, getPrice]);

	useEffect(() => {
		if (!isConnect || selectedCoins) {
			setPayAmount("0");
			validationCheck("0");
			setPayAmountToUSD(0n);
			setReceiveAmount(0n);
			setBalance(0n);
			setPer(0n);
		}
	}, [isConnect, selectedCoins]);

	return (
		<div className={`min-w-80 lg:max-w-xs mb-4`}>
			<div className="w-full bg-gray-500 rounded-t-lg px-4 py-2">
				<div className="flex space-x-8 py-2 items-center">
					<div className="relative">
						<img className="w-10 h-10" src={`/images/currencies/${selectedCoins.destination.symbol}.svg`}></img>
						<img
							className="w-10 h-10 absolute bottom-0 left-6"
							src={`/images/currencies/${selectedCoins.source.symbol}.svg`}
						></img>
					</div>
					<div className="text-xl font-medium">
						{selectedCoins.destination.symbol} / {selectedCoins.source.symbol}
					</div>
				</div>
			</div>
			<div className="w-full bg-gray-700 rounded-b-lg p-4">
				<div className="flex py-1 justify-between w-full">
					<div>Pay</div>
					<div>Available: {formatCurrency(balance, 4)}</div>
				</div>
				{/* ${isError && 'border border-red-500'} */}
				<div className="flex rounded-md bg-black-900 text-base p-2 space-x-4 justify-between">
					<div className="flex font-medium cursor-pointer items-center" onClick={() => openCoinList("source")}>
						<img className="w-6 h-6" src={`/images/currencies/${selectedCoins.source.symbol}.svg`}></img>
						<div className="m-1">{selectedCoins.source.symbol}</div>
						<img className="w-4 h-2" src={`/images/icon/bottom_arrow.png`}></img>
					</div>
					<input
						className="w-2/3 bg-black-900 outline-none text-right font-medium"
						type="text"
						value={payAmount === "0" ? undefined : payAmount}
						placeholder="0"
						onChange={(e) => {
							changePayAmount(e.target.value);
							setPer(0n);
						}}
					/>
				</div>
				<div className="flex justify-end font-medium tracking-wide text-xs w-full text-blue-500 px-3 mt-1">
					<span>${formatCurrency(payAmountToUSD, 2)}</span>
				</div>

				<div className="flex w-9 h-9 bg-gray-500 rounded-full mx-auto cursor-pointer" onClick={() => swapToCurrency()}>
					<div className="m-auto">
						<img className="w-4 h-5 align-middle" src={"/images/icon/exchange.png"}></img>
					</div>
				</div>

				<div className="py-1 justify-between w-full">
					<div>Receive(Estimated)</div>
				</div>

				<div className="flex rounded-md bg-black-900 text-base p-2 space-x-4 justify-between">
					<div className="flex font-medium cursor-pointer items-center" onClick={() => openCoinList("destination")}>
						<img className="w-6 h-6" src={`/images/currencies/${selectedCoins.destination.symbol}.svg`}></img>
						<span className="m-1">{selectedCoins.destination.symbol}</span>
						<img className="w-4 h-2" src={`/images/icon/bottom_arrow.png`}></img>
					</div>
					<input
						className="w-2/3 bg-black-900 outline-none text-right font-medium"
						type="text"
						value={formatCurrency(receiveAmount, 8)}
						disabled
					/>
				</div>

				<div className="py-2 w-full">
					<div className="flex justify-between">
						<input
							className="cursor-pointer w-full mr-1"
							type="range"
							min="0"
							max="100"
							value={per.toString()}
							onChange={(e) => setPerAmount(BigInt(e.target.value))}
						/>
						<div className="border border-gray-200 rounded-md text-sm px-1">{convertNumber(per)}%</div>
					</div>
					<div className="flex justify-between text-xs text-gray-400 w-10/12">
						<span className={`w-8 text-left cursor-pointer ${per === 0n && "text-blue-500"}`} onClick={() => setPerAmount(0n)}>
							0%
						</span>
						<span
							className={`w-8 text-center cursor-pointer ${per === 25n && "text-blue-500"}`}
							onClick={() => setPerAmount(25n)}
						>
							25%
						</span>
						<span
							className={`w-8 text-center cursor-pointer ${per === 50n && "text-blue-500"}`}
							onClick={() => setPerAmount(50n)}
						>
							50%
						</span>
						<span
							className={`w-8 text-center cursor-pointer ${per === 75n && "text-blue-500"}`}
							onClick={() => setPerAmount(75n)}
						>
							75%
						</span>
						<span
							className={`w-8 text-right cursor-pointer ${per === 100n && "text-blue-500"}`}
							onClick={() => setPerAmount(100n)}
						>
							100%
						</span>
					</div>
				</div>
				<div className="pt-4">
					<div className="flex py-2 justify-between w-full">
						<div>Network Fee({gasPrice.toString()}GWEI)</div>
						<div>${formatCurrency(networkFeePrice, 5)}</div>
					</div>
					<div className="flex py-2 justify-between w-full">
						<div>Rate</div>
						<div>1 = {formatCurrency(exchangeRates, 8)}</div>
					</div>

					{BigInt(receiveAmount) > 0n && isValidation && (
						<>
							<div className="flex py-2 justify-between w-full">
								<div>Cost: </div>
								<div>${formatCurrency(price - feePrice, 18)}</div>
							</div>

							<div className="flex py-2 justify-between w-full">
								<div>Fee({utils.formatEther(feeRate * 100n)}%)</div>
								<div>${formatCurrency(feePrice, 18)}</div>
							</div>
						</>
					)}
				</div>
				<button
					className="bg-blue-500 my-6 px-4 py-2 w-full rounded-lg text-center text-2xl font-medium disabled:opacity-75"
					onClick={() => order()}
					disabled={!isConnect || !isValidation}
				>
					Confirm
				</button>
				{!isValidation || !isConnect ? (
					<div className="bg-black-900 w-full text-center text-gray-300 rounded-lg text-xs p-1">
						{!isConnect ? "Connect your wallet" : networkId === 1285 ? validationMessage : "Unsupported Network"}
					</div>
				) : (
					<></>
				)}
			</div>
		</div>
	);
};
export default Order;
