/* eslint-disable react-hooks/exhaustive-deps */
import { networkInfo } from "configure/networkInfo";
import { formatCurrency } from "lib";
// import { changeNetwork } from "lib/network";
import React, { useEffect } from "react";
import { /* useDispatch, */ useDispatch, useSelector } from "react-redux";
import { RootState } from "reducers";
import { PendingCoin, updateStep } from "reducers/bridge/bridge";

interface IBridgeStatus {
    selectedCoin: String;
    setIsProcessing: Function;
}

const BridgeStatus = ({ selectedCoin, setIsProcessing }: IBridgeStatus) => {
    const { step, pendingCoins } = useSelector((state: RootState) => state.bridge);
    const { networkId, address } = useSelector((state: RootState) => state.wallet);
    const [pendingCoin, setPendingCoin] = React.useState<PendingCoin>(null);
    const dispatch = useDispatch();
    const statusMsg = {
        0: "Start and sign the bridge transaction",
        1: "Move the asset to the target network",
        2: "Sign the asset-claim transaction",
    };

    // const pendingCoin = pendingCoins.filter((item) => item.coin === selectedCoin)[0];

    useEffect(() => {
        // console.log('useEffect step', step);
        if (Number(step) === 1 || Number(step) === 3) {
            setIsProcessing(true);
        } else {
            setIsProcessing(false);
        }

        // console.log('useEffect pendingCoins', pendingCoins);
        const currentAsset = pendingCoins.filter((item) => item.coin === selectedCoin)[0];
        setPendingCoin(currentAsset);

        if (!currentAsset || currentAsset.coin !== selectedCoin) {
            if (Number(step) > 1) {
                dispatch(updateStep(0));
            }
            return;
        }

        // console.log('useEffect step, currentAsset', step, currentAsset);
        if (currentAsset.total > 0) {
            if (Number(step) < 2) {
                dispatch(updateStep(2));
                setIsProcessing(false);
            }
        }
    }, [pendingCoins, selectedCoin, address]);

    return (
        <div className="flex flex-col w-full">
            {pendingCoin?.total > 0 && (
                <div className="flex text-[10px] font-medium rounded-lg text-center">
                    <div className="flex flex-row w-full space-x-1 border border-slate-900/40 rounded-lg">
                        {Object.keys(pendingCoin.pendings).map(
                            (key, idx) =>
                                key !== networkId.toString() && (
                                    <div
                                        className="flex flex-col w-full space-x-1 border-2 border-black-900/50"
                                        key={`pending_${idx}`}
                                    >
                                        <div className="py-1 w-full h-6 bg-black-900/30">{networkInfo[key]?.chainName} </div>
                                        <div className={`py-1 w-full h-6 ${pendingCoin.pendings[key] && "text-red-700"}`}>
                                            <span className="pl-1">
                                                {pendingCoin.pendings[key]
                                                    ? `${
                                                        pendingCoin.pendings[key]
                                                            ? formatCurrency(pendingCoin.pendings[key], 4)
                                                            : 0
                                                      } ${selectedCoin}`
                                                    : 0}
                                            </span>
                                        </div>
                                    </div>
                                )
                        )}
                    </div>
                </div>
            )}
            <div className="relative flex w-full">
                <div className="absolute bg-transparent w-full z-10">
                    <ul className="pl-2 pt-4 text-sm">
                        {Object.keys(statusMsg).map((state) => (
                            <li className="pb-1" key={state}>
                                <div className="relative flex items-center  my-4 bg-blue-900">
                                    <div
                                        className={`items-center inline-flex rounded-full 
                                        ${step.toString() >= state && " text-cyan-400 bg-cyan-400 absolute"}
                                        ${step === Number(state) && " animate-ping"}`}
                                    >
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="rgb(115 115 115)"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15Z"
                                                fill="currentColor"
                                            ></path>
                                            <path d="M7.68894 8.54156L6.18321 7.13278C5.77992 6.75545 5.14711 6.7765 4.76978 7.17979C4.39245 7.58308 4.4135 8.2159 4.8168 8.59322L7.0378 10.6712C7.4352 11.043 8.05698 11.0288 8.43694 10.6392L11.3049 7.69817C11.6905 7.30277 11.6826 6.66965 11.2872 6.28406C10.8918 5.89848 10.2587 5.90643 9.87307 6.30183L7.68894 8.54156Z"></path>
                                        </svg>
                                    </div>
                                    {step.toString() >= state && (
                                        <div className="w-4 h-4 relative inline-flex rounded-full text-cyan-400 bg-cyan-500 z-5">
                                            {/*  <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="rgb(115 115 115)"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15Z"
                                                fill="currentColor"
                                            ></path>
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M9 7H11C11.5523 7 12 7.44772 12 8C12 8.55228 11.5523 9 11 9H9V11C9 11.5523 8.55228 12 8 12C7.44772 12 7 11.5523 7 11V9H5C4.44772 9 4 8.55228 4 8C4 7.44772 4.44772 7 5 7H7V5C7 4.44772 7.44772 4 8 4C8.55228 4 9 4.44772 9 5V7Z"
                                            ></path>
                                        </svg> */}
                                        </div>
                                    )}
                                    <div className="flex ml-4">
                                        <span className={`${step.toString() >= state && "font-medium"}`}>
                                            {statusMsg[state]}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="relative flex flex-col items-start mx-[16px] my-[36px] z-0">
                    <span
                        className={`flex w-[1px] h-[60px] z-1 ${(step as number) >= 2 && "bg-cyan-400"} ${
                            (step as number) < 2 && "bg-gray-400/50"
                        }`}
                    />
                    <span
                        className={`flex w-[1px] h-[60px] z-1 ${(step as number) === 3 && "bg-cyan-400"} ${
                            (step as number) < 3 && "bg-gray-400/50"
                        }`}
                    />
                </div>
            </div>
        </div>
    );
};

export default BridgeStatus;
