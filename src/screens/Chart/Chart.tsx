
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'reducers';
import { useEffect, useState } from 'react';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, Label } from 'recharts';

const Chart = ({}) => {
    const { isReady } = useSelector((state: RootState) => state.app);
    const { networkId, address } = useSelector((state: RootState) => state.wallet);
    const selectedCoins = useSelector((state: RootState) => state.selectedCoin);
    const [chartTime, setChartTime] = useState('24H');
    let data = [{price: 100, dd: 1}, {price: 200}, {price: 150}, {price: 300}, {price: 400} , {price: 300}, {price: 100} ,{price: 200} ,{price: 100}]
    
    data = data.concat(data);
    data = data.concat(data);
    data = data.concat(data);
    
    useEffect(() => {

    }, [])

    return (
        
        <div className="w-full bg-gray-700 rounded-lg p-4 lg:h-96">
            <div className="flex flex-col lg:justify-end">
                <div className="flex space-x-8">
                    <div className="relative">
                        <img className="w-10 h-10" src={`/images/currencies/${selectedCoins.destination.symbol}.svg`}></img>
                        <img className="w-10 h-10 absolute bottom-0 left-6" src={`/images/currencies/${selectedCoins.source.symbol}.svg`}></img>
                    </div>
                    <div className="text-xl">
                        {selectedCoins.destination.symbol} / {selectedCoins.source.symbol}
                    </div>
                </div>
                <div className="lg:h-60 mt-8">
                <ResponsiveContainer>
                    <AreaChart data={data}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.5}/>
                                <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip />
                        {/* 라인 */}
                        <Area type="monotone" dataKey="price" stroke="#00F0FF" fillOpacity={1} fill="url(#colorUv)" />
                    </AreaChart>
                </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-lg text-gray-300 font-bold lg:justify-end lg:space-x-4">
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