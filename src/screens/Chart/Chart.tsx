
import { useSelector } from 'react-redux';
import { RootState } from 'reducers';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis } from 'recharts';
import { getChartRates } from 'lib/thegraph/api'

const Chart = () => {
    const selectedCoins = useSelector((state: RootState) => state.selectedCoin);
    const [chartTime, setChartTime] = useState('24H');
    const [data, setData] = useState([]);
    const [currencyNames, setCurrencyNames] = useState<{source: String, destination: String}>();
    
    const init = useCallback(async() => {    
        const chartRate = await getChartRates(
            {
                currencyNames,
                chartTime,
            }); 
            console.log(chartRate[0])
        setData(chartRate);
    },[currencyNames, chartTime]);

    useEffect(() => {
        if(selectedCoins.source.symbol && selectedCoins.destination.symbol) {
            setCurrencyNames ( 
                {
                    source: selectedCoins.source.symbol,
                    destination: selectedCoins.destination.symbol
                }
            )
        } 
        
    }, [selectedCoins])

    useEffect(() => {
        if(currencyNames) {
            setData([]);
            init();
            // const timeout = setInterval(() => {
            //     init();
            // }, 1000 * 60);
            // return () => clearInterval(timeout)    
        }
    }, [currencyNames, chartTime])
    
    return (
        
        <div className="w-full bg-gray-700 rounded-lg p-4 lg:h-96 lg:px-6 lg:py-7">
            <div className="flex flex-col lg:justify-end">
                <div className="flex space-x-8">
                    <div className="relative">
                        <img className="w-10 h-10" src={`/images/currencies/${selectedCoins.destination.symbol}.svg`} alt="currencies"></img>
                        <img className="w-10 h-10 absolute bottom-0 left-6" src={`/images/currencies/${selectedCoins.source.symbol}.svg`} alt="currencies"></img>
                    </div>
                    <div className="text-xl">
                        {selectedCoins.destination.symbol} / {selectedCoins.source.symbol}
                    </div>
                </div>
                {/* <div>{ formatCurrency(exchangeRates, 8)} (${formatCurrency(exchangeRates * sourceRate / (10n ** 18n), 2)})</div> */}
                <div className="lg:h-60 h-60 mt-8">
                <ResponsiveContainer>
                    <AreaChart data={data}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.5}/>
                                <stop offset="95%" stopColor="#FFFFFF" stopOpacity={1}/>
                                
                            </linearGradient>
                        </defs>
                        <Tooltip labelStyle={{color: "transparent"}} contentStyle={{background: "transparent", borderColor: "transparent", color: "#151515"}} itemStyle={{color: "#000000"}}>
                        </Tooltip>
                        <XAxis dataKey="time"/>
                        <YAxis type="number" domain={[dataMin => dataMin, dataMax => dataMax]} hide={true}/>

                        {/* 라인 */}
                        
                        <Area type="monotone" dataKey="price" stroke="#00F0FF" fill="#00F0FF"/>
                        
                    </AreaChart>
                </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-lg text-gray-300 font-extrabold lg:justify-end lg:space-x-4">
                    <button className={chartTime === '24H' && `text-white`} onClick={() => setChartTime('24H')}>24H</button>
                    <button className={chartTime === '3D' && `text-white`} onClick={() => setChartTime('3D')}>3D</button>
                    <button className={chartTime === '1W' && `text-white`} onClick={() => setChartTime('1W')}>1W</button>
                    <button className={chartTime === '1M' && `text-white`} onClick={() => setChartTime('1M')}>1M</button>
                </div>     
            </div>
        </div>
        
    )
}
export default Chart;