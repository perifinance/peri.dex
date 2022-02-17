import { useEffect, useState, useCallback, useRef, forwardRef } from "react";
import { useSelector } from 'react-redux';
import { RootState } from 'reducers';

import { VictoryPie} from 'victory'
import { getLastRates } from "lib/thegraph/api";
import { formatCurrency, formatTimestamp } from "lib";
import { contracts } from 'lib/contract'
import { getBalances } from 'lib/thegraph/api'
import { changeNetwork } from 'lib/network'
import { NotificationManager } from 'react-notifications';
import { getExchageHistories } from 'lib/thegraph/api'
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import pynths from 'configure/coins/pynths'

const Assets = () => {
    const { isReady } = useSelector((state: RootState) => state.app);
    const { coinList } = useSelector((state: RootState) => state.coinList);
    const { address, networkId, isConnect } = useSelector((state: RootState) => state.wallet);
    const [ balances, setBalances ] = useState([]);
    const [ totalAssets, setTotalAssets ] = useState(0n);
    const [ chartDatas, setChartDatas ] = useState([]);
    
    const [ chartColors, setChartColors] = useState([]);
    
    const transaction = useSelector((state: RootState) => state.transaction);
    const [ histories, setHistories ] = useState([]);
    const [ filteredHistory, setFilteredHistory ] = useState([]);
    const [ currentPage, setCurrentPage ] = useState(1);
    const [ searchOptions, setSearchOptions ] = useState<{
        startDate?: Date,
        endDate?: Date,
        src?: String,
        dest?: String,
        action?: String
    }>({});
    const [isStartDate, setIsStartDate] = useState(false);
    const [isEndDate, setIsEndDate] = useState(false);
    const [isSrcCoinList, setIsSrcCoinList] = useState(false);
    const [isDestCoinList, setIsDestCoinList] = useState(false);
    const [isActionList, setIsActionList] = useState(false);

    const [ pages, setPages ] = useState([]);

    const clearOpens = () => {
        setIsStartDate(false)
        setIsEndDate(false)
        setIsSrcCoinList(false)
        setIsDestCoinList(false)
        setIsActionList(false)
    }
    
    const historyFilter = useCallback((item) => {
        if(searchOptions.startDate) {
            if(item.timestamp < formatTimestamp(searchOptions.startDate)) {
                return false
            }
        }

        if(searchOptions.endDate) {
            if(item.timestamp > formatTimestamp(searchOptions.endDate) + 60 * 60 * 24) {
                return false
            }
        }

        if(searchOptions.src && item.src !== searchOptions.src) {
            return false
        }

        if(searchOptions.dest && item.dest !== searchOptions.dest) {
            return false
        }

        if(searchOptions.action && item.state !== searchOptions.action) {
            return false
        }

        return true

    },[searchOptions])

    const getPages = (size: number) => {
        if(size === 0) {
            return [];
        }
        let pageCount = Math.ceil(size / 10);
        pageCount = pageCount === 0 ? 1 : pageCount;
        let pages = [];
        for(let a = 0; a < pageCount; a++) {
            pages.push(a);
        }
        return pages;
    }

    useEffect(() => {
        if(histories.length > 0) {
            const datas = histories.filter(historyFilter)
            setFilteredHistory(datas)
            setPages(getPages(datas.length))
        }
    }, [histories, searchOptions])

    const getHistory = useCallback(async () => {
        const histories = await getExchageHistories({address, first: 1000})
        setHistories(histories)
        
    }, [address, getExchageHistories, setHistories])

    useEffect(() => {
        if(address && !transaction.hash) {
            if(networkId === Number(process.env.REACT_APP_DEFAULT_NETWORK_ID)) {
                getHistory();
            } else {
                changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID);
                setHistories([]);
            }
        } 
    }, [address, transaction, networkId, searchOptions])


    useEffect(() => {
        if(!isConnect) {
            setHistories([]);
        }
    },[isConnect])

    const getAddressColor = (address) => {
        return `#${address.substr(2, 6)}`;
    }

    const init = useCallback(async () => {
        let colors = [];
        try {
            let rates = await getLastRates({});
        
            let balances = (await getBalances({networkId, address, rates}));
            setBalances(balances);
            const totalAssets = balances.reduce((a, b) => a + b.balanceToUSD, 0n);
            setTotalAssets(totalAssets);
            const pieChart = balances.map(e => {
                colors.push(getAddressColor(contracts[`ProxyERC20${e.currencyName}`].address));
                const value = formatCurrency(e.balanceToUSD * 100n * 10n**18n / totalAssets, 2);
                return {
                    x: `${value}%`,
                    y: Number(value)
                }
            })

            setChartDatas(pieChart.length > 0 ? pieChart : [{x: '0%', y: 1}]);
    
            setChartColors(colors);
        }catch(e) {
            console.log(e);
        }
    }, [coinList, address, networkId]);

    useEffect(() => {
        if(isReady && coinList && address && isConnect) {
            if(networkId === Number(process.env.REACT_APP_DEFAULT_NETWORK_ID)) {
                init();
            } else {
                NotificationManager.warning(`This network is not supported. Please change to moonbase network`, 'ERROR');
                changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID)
                setBalances([]);
                setTotalAssets(0n);
                setChartDatas([]);
                setChartColors([]);
            }
        }
        if(!isConnect) {
            setBalances([]);
            setTotalAssets(0n);
            setChartDatas([]);
            setChartColors([]);
        }
    },[init, isReady, coinList, address, networkId, isConnect])
    
    return  (
        <>
            <div className="flex flex-col-reverse lg:flex-row lg:py-7 lg:justify-between lg:space-x-8">
                <div className="flex flex-col w-full">
                    <div className="text-xl lg:pl-8 font-semibold w-full mb-4">Trade Order</div>
                        <div className="flex flex-col space-y-4 xl:flex-row lg:pl-8 xl:space-x-4 xl:space-y-0">
                            <div className="flex">
                                <DatePicker
                                    selected={searchOptions.startDate}
                                    onChange={(date) => setSearchOptions({...searchOptions, startDate: date})}
                                    onInputClick={()=> {clearOpens(); setIsStartDate(!isStartDate)}}
                                    open={isStartDate}
                                    selectsStart
                                    startDate={searchOptions.startDate}
                                    endDate={searchOptions.endDate}
                                    placeholderText="FromDate"
                                    className="bg-gray-500 rounded-lg p-2 font-medium h-12 w-full placeholder-gray-300 outline-none"
                                >
                                    
                                </DatePicker>
                                <div className="px-2 h-12 py-3">~</div>
                                <DatePicker
                                    selected={searchOptions.endDate}
                                    onChange={(date) => setSearchOptions({...searchOptions, endDate: date})}
                                    onInputClick={()=> {clearOpens(); setIsEndDate(!isEndDate)}}
                                    open={isEndDate}
                                    selectsEnd
                                    startDate={searchOptions.startDate}
                                    endDate={searchOptions.endDate}
                                    placeholderText="EndDate"
                                    className="bg-gray-500 rounded-lg p-2 font-medium h-12 w-full placeholder-gray-300 outline-none"
                                />
                            </div>
                            <div className="flex space-x-4 w-full justify-end xl:justify-start">
                                <div className="relative w-36">
                                    <div className="flex justify-between font-medium space-x-2 cursor-pointer items-center bg-gray-500 rounded-lg h-12 p-2" onClick={() => {clearOpens(); setIsSrcCoinList(!isSrcCoinList)}}>
                                        <div className="flex">
                                            {searchOptions?.dest ?
                                                <>
                                                    <img className="w-6 h-6" src={`/images/currencies/${searchOptions?.dest}.png`}></img>
                                                    <div className="m-1">{searchOptions?.dest}</div>
                                                </> :
                                                <div className="text-gray-300">Received</div>
                                            }
                                            
                                            
                                        </div>
                                        <img className="w-4 h-2" src={`/images/icon/bottom_arrow.png`}></img>
                                    </div>
                                    <div className={`absolute w-full bg-gray-700 border-2 border-gray-300 rounded my-2 pin-t pin-l ${isSrcCoinList ? 'block' : 'hidden'} z-10`}>
                                        <ul className="list-reset">

                                            {pynths[networkId]?.map(coin => 
                                                (<li onClick={ () => {setSearchOptions({...searchOptions, dest: coin.symbol}); setIsSrcCoinList(false)}}>
                                                    <p className={`flex space-x-2 p-2 hover:bg-black-900 cursor-pointer ${searchOptions?.dest === coin?.symbol && 'bg-black-900'}`}>
                                                    <img className="w-6 h-6" src={`/images/currencies/${coin?.symbol}.png`}></img>
                                                    <div className="m-1">{coin?.symbol}</div>
                                                </p></li>)
                                            )}
                                        </ul>
                                    </div>
                                </div>

                                <div className="relative w-36">
                                    <div className="flex justify-between font-medium space-x-2 cursor-pointer items-center bg-gray-500 rounded-lg h-12 p-2" onClick={() => {clearOpens(); setIsDestCoinList(!isDestCoinList)}}>
                                        <div className="flex">
                                            {searchOptions?.src ?
                                                <>
                                                    <img className="w-6 h-6" src={`/images/currencies/${searchOptions?.src}.png`}></img>
                                                    <div className="m-1">{searchOptions?.src}</div>
                                                </> : 
                                                <div className="text-gray-300">Paid</div>
                                            }
                                            
                                            
                                        </div>
                                        <img className="w-4 h-2" src={`/images/icon/bottom_arrow.png`}></img>
                                    </div>
                                    <div className={`absolute w-full bg-gray-700 border-2 border-gray-300 rounded my-2 pin-t pin-l ${isDestCoinList ? 'block' : 'hidden'} z-10`}>
                                        <ul className="list-reset">

                                            {pynths[networkId]?.map(coin => 
                                                (<li onClick={ () => {setSearchOptions({...searchOptions, src: coin.symbol}); setIsDestCoinList(false)}}>
                                                    <p className={`flex space-x-2 p-2 hover:bg-black-900 cursor-pointer ${searchOptions?.src === coin?.symbol && 'bg-black-900'}`}>
                                                    
                                                    <img className="w-6 h-6" src={`/images/currencies/${coin?.symbol}.png`}></img>
                                                    <div className="m-1">{coin?.symbol}</div>
                                                </p></li>)
                                            )}
                                        </ul>
                                    </div>
                                </div>

                                <div className="relative w-36">
                                    <div className="flex justify-between font-medium space-x-2 cursor-pointer items-center bg-gray-500 rounded-lg h-12 p-2" onClick={() => {clearOpens(); setIsActionList(!isActionList)}}>
                                        {searchOptions?.action ? 
                                            <div className="m-1">{searchOptions?.action}</div>
                                            :
                                            <div className="text-gray-300">Action</div>
                                        }
                                        <img className="w-4 h-2" src={`/images/icon/bottom_arrow.png`}></img>
                                    </div>
                                    <div className={`absolute w-full bg-gray-700 border-2 border-gray-300 rounded my-2 pin-t pin-l ${isActionList ? 'block' : 'hidden'} z-10`}>
                                        <ul className="list-reset">

                                            {['Appended', 'Settled'].map(action => 
                                                (<li onClick={ () => {setSearchOptions({...searchOptions, action}); setIsActionList(false)}}><p className={`flex space-x-2 p-2 hover:bg-black-900 cursor-pointer ${searchOptions?.action === action && 'bg-black-900'}`}>
                                                    {action}
                                                </p></li>)
                                            )}
                                        </ul>
                                    </div>
                                </div>
                                <div className="justify-end hidden sm:flex">
                                    <div className="flex font-medium space-x-2 cursor-pointer items-center bg-gray-500 rounded-lg h-12 w-12 p-2 justify-center" onClick={() => {clearOpens(); setSearchOptions({})}}>
                                        <img className="w-5 h-5" src={`/images/icon/refresh.svg`}></img>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end sm:hidden">
                                <div className="flex font-medium space-x-2 cursor-pointer items-center bg-gray-500 rounded-lg h-12 w-12 p-2 justify-center" onClick={() => {clearOpens(); setSearchOptions({})}}>
                                    <img className="w-5 h-5" src={`/images/icon/refresh.svg`}></img>
                                </div>
                            </div>
                        </div>
                        {filteredHistory.length > 0 ? 
                            <div className="overflow-x-scroll">
                                <table className="talbe-auto mt-4 mb-2 w-full">
                                    <thead>
                                        <tr className="text-lg text-gray-300">
                                            <th className="font-medium">Date/Time</th>
                                            <th className="font-medium">Received</th>
                                            <th className="font-medium">Paid</th>
                                            {/* <th className="font-medium">Price</th> */}
                                            <th className="font-medium">Action</th>
                                            <th className="font-medium min-w-12"> </th>
                                        </tr>
                                    </thead>
                                
                                    <tbody>
                                        {filteredHistory.slice((currentPage-1) * 10, currentPage*10).map((e) => (
                                            <tr className="border-b border-gray-500 h-10" key={e.id}>
                                                <td className="text-center"><span>{e.date}</span></td>
                                                <td className="text-center">
                                                    <div className="flex justify-end left">
                                                        <img className="w-5 h-5 pr-1" src={`/images/currencies/${e.dest}.png`} alt="currencies"></img> 
                                                        {formatCurrency(e.amountReceived, 8)} 
                                                        <span className="pl-1 font-medium"> {e.dest}</span>
                                                    </div>
                                                </td>
                                                
                                                <td className="text-center">
                                                    <div className="flex justify-end left">
                                                        <img className="w-5 h-5 pr-1" src={`/images/currencies/${e.src}.png`} alt="currencies"></img> 
                                                        {formatCurrency(e.amount, 8)} 
                                                        <span className="pl-1 font-medium"> {e.src}</span>
                                                    </div>
                                                </td>
                                                {/* <td className="text-center">{formatCurrency(e.amount * 10n ** 18n / e.amountReceived, 5)} <span className="pl-1 font-medium"> {e.src}</span></td> */}
                                                <td className="text-center"><span className={`font-medium ${e.state === 'Settled' ? 'text-skyblue-500' : 'text-yellow-500'}`}>{e.state}</span></td>
                                                <td className="text-center">
                                                    <img id="moonbeam" className="w-8 h-8 cursor-pointer mx-auto" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAC4UlEQVR4Ae2WA6wcYRzE65hFXDeqbdu2bbdxatu2bdu2bdtupzOb913vtl1crZf8Vv//zM6Hd3eRAPxS/gf4H8CxkDdZxwrkGHmts+6djb5e62RQjsCOzehrtd4B8iXvfLxC5mlokHcLWhQ+gpakfp6NqJh52vVWRY7Hc3o5a5GLpO53pnymKeqXTnr6bEalLDNvsB7DK4BMYjfKt/0Dz3DhGelo03XVcw/dPvk7BZBJdLLLzaRgyp6aGV3fJokjdEk4ygeq8dqLnSSaU4DGXgZaz8Kp+qBx/p26f0eONM6/652eqaYeH9T7LIDWh1zyE0DkS9YJxdMOEbrWs3ACnCPR7AHqtSh8GLVzreKGmYVymSZZVMo6i89WQzUTwA31+PAR1QMBlIZreLN8pskom3HCF1GtYb6tnqNTj0+fkySKFaBWzhVDTEPD1jPQdcdSDH6wWljXDVrNMAYczUQUSzPI2gcFUnTnqDvpbN2XSDccPn1MiIqReBObU/ROD9uPmYfBT1agx+XZ6HxqitC1nqkWEOdL3gVF0wxE9RxLhK6tZ2UyjINfH81E80IHdylAF2KlW/PyMHbcP4HOJ6ag04nJBhpMlVijkjjwcn1YCRPC+Fx4exuP3jxDvzNz3HxEDwU4RKwpuvX6IfQ34OzcEKHQCNSjXo3UHqBU+lEwPg/ePsX7Dx8w7NwiNx9xRAFeEQy+vxpDLyzEhEsrrcYR55dg8NkFQemnqMcI339agsURox8P49P7zCwMPDvP0g09txALr29z8nkdEkBF03jk0XlsvXckVPggIHzGf7lH5Bo5r7MJYPdZdnMn7r9+7OTzNHgJND2m0WvqDtu+Q77ax2xCbQxtEG0UNXpuHluAr/aRMA55HMa/4WNpbAG+2seIy5IP1gjazLSmaPDD1ULXwYk/qFcaG1/tEywuR54QOPDE5eVf7WMXxyI9yFHyhjwjB0hX1Txe/lU+/3+W/w/wP8BHrC3DQabFPxAAAAAASUVORK5CYII="
                                                        onClick={() => 
                                                            window.open(`https://moonbase.moonscan.io/tx/${e.appendedTxid || e.settledTxid}`, '_blank')
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <ul className="flex rounded justify-center">
                                {
                                    pages.map((e) => {
                                        return <li>
                                            <a className={`block hover:text-white hover:underline text-blue px-3 py-2 cursor-pointer ${currentPage === e + 1 ? ' font-bold': 'none'} `} onClick={() => setCurrentPage(e+1)}>
                                                {e + 1}
                                            </a>
                                        </li>
                                    })
                                }
                            </ul>
                        </div> 
                        :
                        <div className="text-base text-center lg:text-left lg:pl-8 border-b border-gray-500 text-gray-300 font-medium mt-5">
                            No Trade History
                        </div> 
                        
                        
                    }
                </div>
                <div className="flex flex-col bg-gray-700 rounded-lg px-4 max-w-sm mb-4 min-w-80 lg:min-h-max lg:mb-0">
                    <div className="flex py-6 justify-between text-lg">
                        <div className="font-bold">Total Asset</div>
                        <div className="font-bold">{formatCurrency(totalAssets, 4)} $</div>
                    </div>
                    {
                        balances.length > 0 && 
                        <>
                            <div className="border border-gray-500"></div>
                            <div className="py-5">
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
                                        labels={({datum}) => datum.y >= 5 ? `${datum.y}%` : ''}
                                        style={{ labels: { fill: "white", fontSize: 20 } }}
                                        
                                    />
                                </div>
                                <div className="text-base">
                                    {balances.map(({amount}, index) => amount > 0n ? 
                                        <div className="flex" key={index}>
                                            <div className="flex py-2 justify-between w-full">
                                                <div className="flex items-center" key={index}>
                                                    <div className="font-bold min-w-12">{coinList[index]?.symbol}</div>
                                                    <div className="mx-4 w-3 h-3" style={{background: chartColors[index]}}></div>
                                                </div>
                                                <div className="">{chartDatas[index]?.y}%</div>
                                            </div>
                                        </div>
                                        : <></>
                                    )}
                                </div>
                            </div>
                        </>
                    }
                    <div className="mb-14 flex-1 bg-gray-700 rounded-lg max-w-sm">
                        {balances.length > 0 && balances.map(({currencyName, amount, balanceToUSD}, index) => 
                            amount > 0n ?
                            <div className="font-semibold" key={index}>
                                <div className="border border-gray-500 my-5"></div>
                                <div className="flex justify-between">
                                    <div className="flex">
                                        <img className="w-6 h-6 pr-1" src={`/images/currencies/${currencyName}.png`} alt="currencies"></img>     
                                        <span className="pl-1 text-base font-medium"> {currencyName}</span>
                                    </div>
                                    
                                    <div className="flex flex-col leading-none">
                                        <div className="font-medium text-gray-300 text-right">
                                            Holding Quantity
                                        </div>
                                        <div className="text-right text-base mt-1">
                                            <span>{formatCurrency(amount, 6)}</span>
                                            <span className="ml-1">{currencyName}</span>
                                        </div>
                                        <div className="font-medium text-gray-300 text-right pt-5">
                                            Evaluation Amount
                                        </div>
                                        <div className="text-right text-base mt-1">
                                            <span>{formatCurrency(balanceToUSD, 4)}</span>
                                            <span className="ml-1">$</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            :
                            <></>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Assets;