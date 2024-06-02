import React, { useCallback, useEffect, useState } from "react";
import { VictoryPie } from "victory";
import { useContracts } from "lib/contract";
import { /* formatCurrency, */ formatNumber } from "lib";
import { isExchageNetwork } from "lib/network";

// import { setLoading } from "reducers/loading";
import { useSelector } from "react-redux";
import { RootState } from "reducers";
// import { toBigInt, toNumber } from "lib/bigInt";
type PortfolioProps = {
    standAlone?: boolean;
};
const Portfolio = ({ standAlone = true }: PortfolioProps) => {

    const { isReady } = useSelector((state: RootState) => state.app);
    const { coinList, symbolMap } = useSelector((state: RootState) => state.coinList);
    const { address, networkId, isConnect } = useSelector((state: RootState) => state.wallet);
    const { balancePynths } = useSelector((state: RootState) => state.pynthBlances);

    const [totalAssets, setTotalAssets] = useState(0);
    const [chartDatas, setChartDatas] = useState([]);
    const [balances, setBalances] = useState([]);
    const [chartColors, setChartColors] = useState([]);
    const [{ contracts }] = useContracts();

    const getAddressColor = (address) => {
        return `#${address.substr(2, 6)}`;
    };

    const init = useCallback(async () => {
        if (balancePynths.length === 0) return;

        // dispatch(setLoading({ name: "balance", value: true }));

        let colors = [];

        try {
            let totalAssets = 0;
            const balances = balancePynths.map((c) => {
                const idx = symbolMap[c.currencyName];
                const price = idx ? coinList[idx].price : 0;
                const amount = c.amount;
                const balanceToUSD = c.currencyName === "pUSD" ? amount : (amount * price);
                totalAssets += balanceToUSD;
                return { ...c, balanceToUSD };
            });

            setTotalAssets(totalAssets);

            const pieChart = balances.map((e) => {
                e.currencyName === "pUSD"
                    ? colors.push("#1e91f8")
                    : colors.push(getAddressColor(contracts[`ProxyERC20${e.currencyName}`].address));
                const value = totalAssets ? formatNumber((e.balanceToUSD * 100) / totalAssets, 2) : 0;

                return {
                    x: `${value}%`,
                    y: Number(value),
                };
            });

            pieChart.sort((a, b) => b.y - a.y);
            balances.sort((a, b) => b.balanceToUSD - a.balanceToUSD);

            setBalances(balances);
            setChartDatas(totalAssets > 0 ? pieChart : [{ x: "100%", y: 1 }]);
            setChartColors(colors);
            // dispatch(setLoading({ name: "balance", value: false }));
        } catch (e) {
            console.error("init error", e);
        }

        // dispatch(setLoading({ name: "balance", value: false }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [balancePynths, coinList[1]]);

    useEffect(() => {
        if (isReady && coinList.length && address && isConnect) {
            if (isExchageNetwork(networkId)) {
                init();
            } else {
                // NotificationManager.warning(
                // 	`This network is not supported. Please change to moonriver network`,
                // 	"ERROR"
                // );
                // changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID);
                setTotalAssets(0);
                setBalances([]);
                setChartDatas([]);
                setChartColors([]);
            }
            return;
        }

        if (!isConnect) {
            setTotalAssets(0);
            setBalances([]);
            setChartDatas([]);
            setChartColors([]);
        }
    }, [/* isReady, address, networkId, */ init, isConnect]);

    return (
        <div
            className={`lg:flex flex-col items-center w-[98%] lg:w-[30%] min-h-[99%] rounded-lg pb-3 mb-2 ${
                standAlone ? "flex " : "hidden h-[98%]"
            } bg-gradient-to-tl from-cyan-950 via-blue-950 to-cyan-950 `}
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
                                ${formatNumber(totalAssets, 4)}
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
                            amount > 0n ? (
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
                            ) : null
                        )}
                    </div>
                </div>
            )}
            <div className="flex w-[90%] justify-start mt-1">
                {balances.length > 0 && <span className="my-auto font-bold text-base mr-1.5 ">Assets</span>}
            </div>
            <div className={`flex flex-col w-[95%] mb-1 overflow-y-auto `}>
                {balances.length > 0 &&
                    balances.map(
                        ({ currencyName, amount }, index) => (
                            /* amount > 0n ? ( */
                            <div
                                className={`text-[9px] sm:text-xs md:text-[11px] xl:text-xs m-1 p-[6px] rounded-md ${
                                    index % 2 === 0 ? "bg-gradient-to-l" : "bg-gradient-to-r"
                                }  from-blue-950 via-cyan-950 to-blue-950`}
                                key={currencyName}
                            >
                                <div className="flex justify-between px-4">
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
                                            <span>{formatNumber(amount, 6)}</span>
                                        </div>
                                        <div className="text-[8px] text-gray-300 text-right pt-2">
                                            Evaluation Amount
                                        </div>
                                        <div className="text-right  mt-1">
                                            <span className="ml-1">$</span>
                                            <span>
                                                {formatNumber(
                                                    ((coinList[symbolMap[currencyName]]?.price ?? 0) * amount), 4
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                        /* ) : (
                            null
                        ) */
                    )}
            </div>
        </div>
    );
};

export default Portfolio;
