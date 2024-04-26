import React, { useCallback, useEffect, useState } from "react";
import { VictoryPie } from "victory";
import { contracts } from "lib/contract";
import { getBalances } from "lib/thegraph/api";
import { formatCurrency } from "lib";
import { isExchageNetwork } from "lib/network";

import { setLoading } from "reducers/loading";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "reducers";
type PortfolioProps = {
    standAlone?: boolean;
};
const Portfolio = ({ standAlone = true }: PortfolioProps) => {
    const dispatch = useDispatch();

    const { isReady } = useSelector((state: RootState) => state.app);
    const { coinList } = useSelector((state: RootState) => state.coinList);
    const { address, networkId, isConnect } = useSelector((state: RootState) => state.wallet);

    const [balances, setBalances] = useState([]);
    const [totalAssets, setTotalAssets] = useState(0n);
    const [chartDatas, setChartDatas] = useState([]);

    const [chartColors, setChartColors] = useState([]);

    const getAddressColor = (address) => {
        return `#${address.substr(2, 6)}`;
    };

    const init = useCallback(async () => {
        dispatch(setLoading({ name: "balance", value: true }));

        let colors = [];

        try {
            // let rates = await getLastRates({ currencyName: govCoin[networkId] });
            let balances: any = await getBalances({ networkId, address });
            setBalances(balances);
            // console.log("balances", balances);
            const totalAssets = balances.reduce((a, c) => a + c.balanceToUSD, 0n);
            setTotalAssets(totalAssets);

            // console.log("totalAssets", totalAssets);

            const pieChart = balances.map((e) => {
                e.currencyName === "pUSD"
                    ? colors.push("#1e91f8")
                    : colors.push(getAddressColor(contracts[`ProxyERC20${e.currencyName}`].address));
                const value = totalAssets ? formatCurrency((e.balanceToUSD * 100n * 10n ** 18n) / totalAssets, 2): 0;

                // console.log("currencyName", e.currencyName, "value", value);

                return {
                    x: `${value}%`,
                    y: Number(value),
                };
            });

            setChartDatas(pieChart.length > 0 ? pieChart : [{ x: "0%", y: 1 }]);
            setChartColors(colors);
            dispatch(setLoading({ name: "balance", value: false }));
        } catch (e) {
            console.error("init error", e);
        }

        dispatch(setLoading({ name: "balance", value: false }));
    }, [coinList, address, networkId]);

    useEffect(() => {
        if (isReady && coinList && address && isConnect) {
            if (isExchageNetwork(networkId)) {
                init();
            } else {
                // NotificationManager.warning(
                // 	`This network is not supported. Please change to moonriver network`,
                // 	"ERROR"
                // );
                // changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID);
                setBalances([]);
                setTotalAssets(0n);
                setChartDatas([]);
                setChartColors([]);
            }
        }
        if (!isConnect) {
            setBalances([]);
            setTotalAssets(0n);
            setChartDatas([]);
            setChartColors([]);
        }
    }, [init, isReady, coinList, address, networkId, isConnect]);

    return (
        <div
            className={`lg:flex flex-col items-center w-[98%] lg:w-[30%] min-h-[98%] bg-blue-900 rounded-lg pb-2 ${
                standAlone ? "flex " : "hidden h-[98%]"
            }`}
        >
            <div className="flex py-2 justify-between items-center w-[90%] ">
                <div className="font-bold text-base md:text-lg lg:text-base">Portfolio</div>
            </div>
            {balances.length > 0 && (
                <div className="flex flex-row justify-between items-center w-[95%]">
                    {/* <div className="flex">
						<div className="flex py-2 justify-between w-full">
							<div className="text-sm lg:text-base font-bold">Portfolio</div>
						</div>
					</div> */}

                    <div className="flex flex-col w-[60%] items-center relative">
                        <VictoryPie
                            data={chartDatas}
                            colorScale={chartColors}
                            labelRadius={() => 120}
                            innerRadius={80}
                            labels={({ datum }) => (datum.y >= 5 ? `${datum.y}%` : "")}
                            style={{ labels: { fill: "white", fontSize: 20 } }}
                        ></VictoryPie>
                        <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] flex flex-col leading-3 ss:leading-4 sm:leading-5 md:leading-7 lg:leading-3">
                            <span className="inline-block text-center align-middle font-bold text-[8px] xs:text-[10px] ss:text-[11px] sm:text-lg lg:text-[11px] xl:text-xs">
                                ${formatCurrency(totalAssets, 4)}
                            </span>
                            <span className="inline-block text-center align-middle font-light text-[8px] xstext-[9px] ss:text-[10px] sm:text-sm lg:text-[10px]">
                                Balance
                            </span>
                        </div>
                    </div>
                    <div
                        className={`flex flex-col items-start w-[40%] text-[10px] sm:text-sm lg:text-[11px] xl:text-xs`}
                    >
                        {balances.map(({ currencyName, amount }, index) =>
                            amount > 0n 
                            ? (
                                <div className="flex w-11/12" key={index}>
                                    <div className="flex pb-1 md:pb-2 lg:pb-1 items-center justify-between w-[95%]">
                                        <div className=" w-7/12">{currencyName}</div>
                                        <div
                                            className="mx-2 w-3 h-3 md:w-4 md:h-4 lg:w-3 lg:h-3"
                                            style={{
                                                background: chartColors[index],
                                            }}
                                        ></div>
                                        <div className="w-5/12 flex justify-end">{chartDatas[index]?.y}%</div>
                                    </div>
                                </div>
                            ) : (
                                null
                            )
                        )}
                    </div>
                </div>
            )}
            <div className="flex w-[90%] justify-start mt-1">
                {balances.length > 0 && <span className="my-auto font-bold text-base mr-1.5 ">Assets</span>}
            </div>
            <div className={`flex flex-col w-[95%] mb-1 overflow-y-auto `}>
                {balances.length > 0 &&
                    balances.map(({ currencyName, amount, balanceToUSD }, index) =>
                        amount > 0n ? (
                            <div
                                className="text-[9px] sm:text-xs md:text-[11px] xl:text-xs bg-blue-950 m-1 p-[6px] rounded-md"
                                key={currencyName}
                            >
                                <div className="flex justify-between">
                                    <div className="flex items-center text-xs ss:text-sm">
                                        <img
                                            className="w-6 h-6 pr-1"
                                            src={`/images/currencies/${currencyName}.svg`}
                                            alt="currencies"
                                        ></img>
                                        <div className="text-right font-semibold mt-1">
                                            <span className="ml-1">{currencyName}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col leading-none">
                                        <div className="text-[8px] text-gray-300 text-right">Holding Quantity</div>
                                        <div className="text-right  mt-1">
                                            <span>{formatCurrency(amount, 6)}</span>
                                        </div>
                                        <div className="text-[8px] text-gray-300 text-right pt-2">
                                            Evaluation Amount
                                        </div>
                                        <div className="text-right  mt-1">
                                            <span className="ml-1">$</span>
                                            <span>{formatCurrency(balanceToUSD, 4)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            null
                        )
                    )}
            </div>
        </div>
    );
};

export default Portfolio;
