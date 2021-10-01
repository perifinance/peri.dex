
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'reducers';
import { useEffect } from 'react';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, Label } from 'recharts';

const Chart = ({}) => {
    const { isReady } = useSelector((state: RootState) => state.app);
    const { networkId, address } = useSelector((state: RootState) => state.wallet);

    useEffect(() => {

    }, [])

    return (
        
        <div className="w-full bg-gray-800 rounded-lg p-4 mt-8">
            <div className="flex flex-col">
                <div>pUSD/USDC</div>
                <ResponsiveContainer>
                    <AreaChart width={730} height={250} data={[{uv: 100}, {uv: 200}, {uv: 150}, {uv: 300}, {uv: 400} , {uv: 300}, {uv: 100} ,{uv: 200} ,{uv: 100}]}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" />
                        <YAxis />
                        
                        <Tooltip />
                        <Area type="monotone" dataKey="uv" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
                    </AreaChart>
                </ResponsiveContainer>            
            </div>
        </div>
        
    )
}
export default Chart;