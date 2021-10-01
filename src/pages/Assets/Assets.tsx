import { useEffect, useState, useCallback } from "react";
import { useSelector } from 'react-redux';
import { RootState } from 'reducers';

import { VictoryPie } from 'victory'
import { getBalance } from 'lib/balance'
import { getExchangeRates } from "lib/rates";
import { formatCurrency } from "lib";
import { utils } from "ethers";
import { contracts } from 'lib/contract'
const Assets = () => {
    const { isReady } = useSelector((state: RootState) => state.app);
    const { coinList } = useSelector((state: RootState) => state.coinList);
    const { address } = useSelector((state: RootState) => state.wallet);
    const [ balances, setBalances ] = useState([]);
    const [ totalAssets, setTotalAssets ] = useState(0n);
    const [ chartDatas, setChartDatas ] = useState([]);
    const [ chartColors, setChartColors] = useState([]);
    
    const getAddressColor = (address) => {
        return `#${address.substr(2, 6)}`;
    }

    const initBalance = async (symbol: string) => {
        return (async() => {
            const balance = await getBalance(address, symbol, 18);
            if(balance > 0n) {
                try {
                    const exchangRate = await getExchangeRates(symbol);
                    const balanceToUSD = balance * exchangRate / (10n ** 18n);
                    return {
                        balance,
                        exchangRate,
                        balanceToUSD
                    }
                } catch(e) {
                    return {
                        balance: 0n,
                        exchangRate: 0n,
                        balanceToUSD: 0n
                    }
                }
            } else {
                return {
                    balance: 0n,
                    exchangRate: 0n,
                    balanceToUSD: 0n
                }
            }
        })()
    }

    const init = async () => {
        let detaPromise = [];
        let colors = [];

        coinList.forEach((e) => {
            colors.push(getAddressColor(contracts[`ProxyERC20${e.symbol}`].address));
            detaPromise.push(initBalance(e.symbol))
        });
        
        let balances = await Promise.all(detaPromise);
        setBalances(balances); 
        
        const totalAssets = balances.reduce((a, b) => a + b.balanceToUSD, 0n);
        setTotalAssets(totalAssets);

        setChartDatas(balances.map(e => { 
            const value = formatCurrency((e.balanceToUSD * 100n * 10n**18n / totalAssets).toString(), 2);
            return {
                x: `${value}%`,
                y: value
            }
        }));

        setChartColors(colors);
    }
    
    useEffect(() => {
        if(isReady && coinList && address) {
            init();
        }
        
    },[isReady, coinList, address])

    return  (
        <div className="max-w-sm">
            <div className="w-full bg-gray-800 rounded-lg p-4">
                <div className="flex">
                    <div className="flex py-2 justify-between w-full">
                        <div className="text-gray-200">Total Assests</div>
                        <div className="text-gray-200">${formatCurrency(totalAssets, 4)}</div>
                    </div>
                </div>
                <div className="border border-gray-600 mx-2 my-8"></div>
                {
                    balances.length > 0 && 
                    <>
                        <div className="flex">
                            <div className="flex py-2 justify-between w-full">
                                <div className="text-gray-200">Portfolio</div>
                            </div>
                        </div>

                        <div className="px-12">
                            <VictoryPie
                                data={chartDatas}
                                colorScale={chartColors}
                                labelRadius={() => 85 }
                                innerRadius={80}
                                style={{ labels: { fill: "white", fontSize: 18, fontWeight: "bold" } }}
                            />
                        </div>
                        <div>
                            {balances.map((balance, index) => balance.balance > 0n ? 
                                <div className="flex">
                                    <div className="flex py-2 justify-between w-full">
                                        <div className="flex text-gray-200 items-center	" key={index}>
                                            <div>{coinList[index].symbol}</div>
                                            <div className="mx-4 w-3 h-3" style={{background: chartColors[index]}}></div>
                                        </div>
                                        <div className="text-gray-200">{chartDatas[index]?.y}%</div>
                                    </div>
                                </div>
                                : null
                            )}
                        </div>
                    </>
                }
                {balances.length > 0 && balances.map((balance, index) => balance.balance > 0n ?
                    <>
                        <div className="border border-gray-600 mx-2 my-8"></div>
                        <div className="flex justify-between">
                            <div className="text-gray-200">{coinList[index].symbol}</div>
                            <div className="flex flex-col">
                                <div className="text-gray-200 text-right">
                                    {formatCurrency(balance.balance, 18)}
                                    {coinList[index].symbol}
                                </div>
                                <div className="text-gray-600 text-right">
                                    Holding Quantity
                                </div>
                                <div className="text-gray-200 text-right">
                                    {formatCurrency(balance.balanceToUSD, 18)}
                                    $
                                </div>
                                <div className="text-gray-600 text-right">
                                    Evaluation Amount
                                </div>
                            </div>
                        </div>
                    </>
                : <></>)}
            </div>
        </div>
    )
}

export default Assets;