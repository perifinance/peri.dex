const BridgeCoinList = ({coinList, setSelectedCoin, setIsCoinList}) => {
    return (
            <div className="flex mb-6 card-width bg-gray-700 rounded-lg p-4 min-h-full overflow-y-scroll">
                <div className="w-full">
                    <div className="mb-4">
                        <div className="relative text-center mb-4 ml-4">
                            <button type="button" className="absolute top-0 bottom-0 block" onClick={() => setIsCoinList(false)}>
                                <img src="images/icon/left_arrow.svg" alt="left_arrow"></img>
                            </button>
                            <div className="text-lg">
                                Select a token
                            </div>
                        </div>
                        <div className="py-3 text-sm">
                            {coinList.map((coin, index) => {
                                return (
                                    <div key={index} className={`flex justify-start cursor-pointer text-gray-200 hover:bg-gray-900 rounded-md px-2 py-2 my-2`} onClick={() =>{ setSelectedCoin(coin); setIsCoinList(false);}}>
                                        <img className="w-6 h-6 mx-2" src={`images/currencies/${coin.name}.svg`} alt="network"/>
                                        <div className="flex-grow font-medium px-2">{coin.name}</div>
                                        <div className="text-sm font-normal text-gray-300 tracking-wide">{coin.name}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        
    )
}
export default BridgeCoinList;