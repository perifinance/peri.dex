import React from 'react';
import { formatCurrency } from 'lib'

const NetworkList = ({networks, selectedNetwork, setSelectedNetwork, setIsNetworkList}) => {
  return (
    <div className="flex mb-6 card-width bg-gray-700 rounded-lg p-4 min-h-full overflow-y-scroll">
      <div className="w-full">
        <div className="mb-4">
          <div className="relative text-center mb-4 ml-4">
            <button type="button" className="absolute top-0 bottom-0 block" onClick={() => setIsNetworkList(false)}>
              <img src="images/icon/left_arrow.svg"></img>
            </button>
            <div className="text-lg">
              Select a network
            </div>
          </div>
          <div className="py-3 text-sm">
            {networks.map((network, index) => {
              return (
                <div key={index} className={`flex justify-start cursor-pointer text-gray-200 hover:bg-black-900 rounded-md px-2 py-2 my-2 ${network?.id === selectedNetwork?.id && 'bg-black-900'}`} onClick={ () => {setSelectedNetwork(network); setIsNetworkList(false)}}>
                  <div className="flex-grow font-medium px-2">{network.name}</div>
                  {/* <div className="text-sm font-normal text-gray-300 tracking-wide">
                      {formatCurrency(network.balance, 4)}
                  </div> */}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>   
  )
}
export default NetworkList;