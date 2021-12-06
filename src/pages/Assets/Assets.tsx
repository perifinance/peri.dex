import { useEffect, useState, useCallback } from "react";
import { useSelector } from 'react-redux';
import { RootState } from 'reducers';

import { VictoryPie } from 'victory'
import { getLastRates } from "lib/thegraph/api";
import { formatCurrency } from "lib";
import { contracts } from 'lib/contract'
import { getBalances } from 'lib/thegraph/api'

const Assets = () => {
    const { isReady } = useSelector((state: RootState) => state.app);
    const { coinList } = useSelector((state: RootState) => state.coinList);
    const { address, networkId } = useSelector((state: RootState) => state.wallet);
    const [ balances, setBalances ] = useState([]);
    console.log(balances);
    const [ totalAssets, setTotalAssets ] = useState(0n);
    const [ chartDatas, setChartDatas ] = useState([]);
    
    const [ chartColors, setChartColors] = useState([]);
    
    const getAddressColor = (address) => {
        return `#${address.substr(2, 6)}`;
    }

    const init = useCallback(async () => {
        let colors = [];

        coinList.forEach((e) => {
            colors.push(getAddressColor(contracts[`ProxyERC20${e.symbol}`].address));
        });

        let rates = await getLastRates({});
        
        let balances = (await getBalances({networkId, address, rates}));
        
        setBalances(balances); 
        
        const totalAssets = balances.reduce((a, b) => a + b.balanceToUSD, 0n);
        setTotalAssets(totalAssets);

        setChartDatas(balances.filter((e)=> e.balanceToUSD > 0n).map(e => {
            const value = formatCurrency((e.balanceToUSD * 100n * 10n**18n / totalAssets).toString(), 2);
            return {
                x: `${value}%`,
                y: Number(value)
            }
        }));

        setChartColors(colors);
    }, [coinList, address, networkId])
    useEffect(() => {

    }, [])
    useEffect(() => {
        if(isReady && coinList && address && networkId) {
            init();
        }
    },[init, isReady, coinList, address, networkId])

    return  (
        <>
            {totalAssets > 0n &&
                <div className="lg:flex lg:flex-row lg:py-7 lg:justify-between lg:space-x-4 xl:space-x-20">
                    <div className="flex flex-col bg-gray-700 rounded-lg p-4 lg:min-h-max lg:mb-4 max-w-sm">
                        <div className="flex py-2 justify-between w-full text-lg">
                            <div className="font-bold">Total Assests</div>
                            <div>{formatCurrency(totalAssets, 4)}$</div>
                        </div>
                        {
                            balances.length > 0 && totalAssets > 0n && 
                            <>
                                <div className="border border-gray-500 mx-2 my-8"></div>
                                <div className="">
                                    <div className="flex">
                                        <div className="flex py-2 justify-between w-full">
                                            <div className="text-lg font-bold">Portfolio</div>
                                        </div>
                                    </div>

                                    <div className="px-12">
                                        <VictoryPie
                                            data={chartDatas}
                                            colorScale={chartColors}
                                            labelRadius={() => 90 }
                                            innerRadius={60}
                                            style={{ labels: { fill: "white", fontSize: 20 } }}
                                        />
                                    </div>
                                    <div className="text-base">
                                        {balances.map(({amount}, index) => amount > 0n ? 
                                            <div className="flex" key={index}>
                                                <div className="flex py-2 justify-between w-full">
                                                    <div className="flex items-center" key={index}>
                                                        <div className="font-bold min-w-12">{coinList[index].symbol}</div>
                                                        <div className="mx-4 w-3 h-3" style={{background: chartColors[index]}}></div>
                                                    </div>
                                                    <div className="">{chartDatas[index]?.y}%</div>
                                                </div>
                                            </div>
                                            : null
                                        )}
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                    <div className="mb-14 flex-1 bg-gray-700 rounded-lg p-4 lg:mb-0">
                    {balances.length > 0 && balances.map(({currencyName, amount, balanceToUSD}, index) => amount > 0n ?
                        <div className="text-base font-semibold" key={index}>
                            <div className="border border-gray-500 mx-2 my-8"></div>
                            <div className="flex justify-between">
                                <div className="">{currencyName}</div>
                                <div className="flex flex-col">
                                    <div className="text-right">
                                        <span>{formatCurrency(amount, 6)}</span>
                                        <span className="ml-1">{currencyName}</span>
                                    </div>
                                    <div className="text-gray-600 text-right font-light">
                                        Holding Quantity
                                    </div>
                                    <div className="text-right pt-4">
                                        <span>{formatCurrency(balanceToUSD, 4)}</span>
                                        <span className="ml-1">$</span>
                                    </div>
                                    <div className="text-gray-600 text-right font-light">
                                        Evaluation Amount
                                    </div>
                                </div>
                            </div>
                        </div>
                    : <></>)}
                    </div>
                
            </div>
            }    
        </>
    )
}

export default Assets;