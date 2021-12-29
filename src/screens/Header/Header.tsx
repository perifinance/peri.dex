
import { useEffect, useState } from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useLocation
} from "react-router-dom";

import { RootState } from 'reducers'
import { useSelector, useDispatch } from "react-redux"
import { clearWallet, clearBalances } from 'reducers/wallet'
import { onboard } from 'lib/onboard'
import { SUPPORTED_NETWORKS } from 'lib/network'
import './Header.css'
const networkColor = {
    80001: '#53cbc9'
}

const Header = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const { address, networkId } = useSelector((state: RootState) => state.wallet);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { isConnect } = useSelector((state: RootState) => state.wallet);

    const getNetworkName = (networkId) => {
        let returnValue;
        switch (networkId) {
            case 97: returnValue = 'BSCTEST'
                break;
            case 80001: returnValue = 'MUMBAI'
                break;
            case 1287: returnValue = 'Mbase'
                break;
            default: returnValue = 'Wrong Network'
                break;
        }
        console.log(returnValue);
        return returnValue;
    }
    
    const onConnect = async () => {
        try {
            await onboard.walletSelect();
            await onboard.walletCheck();
        } catch(e) {
        }
        
    }

    useEffect(() => {
        setDropdownOpen(false);
    }, [location])

    const onDisConnect = () => {
        ////todo:: need bug
        onboard.walletReset();
        localStorage.removeItem('selectedWallet');
        dispatch(clearWallet());
        dispatch(clearBalances());
    }

    return (
        <header className="">
            <div className="corner flex">
                <Link to="/"><img className="w-14 h-9 lg:w-20 lg:h-14" alt="Logo"/></Link>
                <nav className="flex items-center w-0 justify-between lg:visible lg:w-auto lg:ml-4">
                    <ul>
                        {/* <li className="space-x-5 text-xl inline m-10">
                            <Link className="hidden sm:inline-block text-gray-700 hover:text-indigo-700" to="/">Home</Link>
                        </li> */}
                        <li className="text-xl font-bold inline m-4">
                            <Link className={`hidden lg:inline-block hover:text-blue-500 ${location.pathname === '/exchange' && 'text-blue-500'}`} to="/exchange">EXCHANGE</Link>
                        </li>
                        {/* <li className="text-xl font-bold inline m-4">
                            <Link className={`hidden lg:inline-block hover:text-blue-500 ${location.pathname === '/futures' && 'text-blue-500'}`} to="/futures">PERPETUAL</Link>
                        </li> */}
                        <li className="text-xl font-bold inline m-4">
                            <Link className={`hidden lg:inline-block hover:text-blue-500 ${location.pathname === '/assets' && 'text-blue-500'} ${!isConnect && 'text-gray-500' }`} to="/assets">ASSETS</Link>
                        </li>
                        <li className="text-xl font-bold inline m-4">
                            <Link className={`hidden lg:inline-block hover:text-blue-500 ${location.pathname.includes('/bridge') && 'text-blue-500'}`} to="/bridge/submit">BRIDGE</Link>
                        </li>
                    </ul>
                </nav>
            </div>
            
            <div className="flex items-center h-9">
                {
                    isConnect && 
                    
                    <div className="flex bg-gray-700 rounded-l-lg font-medium h-9">
                        {SUPPORTED_NETWORKS[networkId] ? 
                        <>
                        <div className="text-gray-400 mx-2 my-auto">
                            {address && address.slice(0, 6) + '...' + address.slice(-4, address.length)}
                        </div>

                        <div className="transform rotate-45 my-auto">
                            <div className="bg-red-500" style={{width: '8px', height: '8px'}}></div>
                        </div>

                        <div className={`mx-2 truncate ${ SUPPORTED_NETWORKS[networkId] || 'text-red-500'} my-auto`}>
                            {getNetworkName(networkId)}
                        </div>
                        </>
                        :
                        <div className={`px-8 truncate ${ SUPPORTED_NETWORKS[networkId] || 'text-red-500'} my-auto`}>
                            {getNetworkName(networkId)}
                        </div>
                        }
                    </div> 
                    
                }
                
                <button className={`w-9 h-full mt-0 bg-gray-500 ${isConnect ? 'rounded-r-lg' : 'rounded-lg'}`} onClick={() => isConnect ? onDisConnect() : onConnect() }>
                    <img className="w-4 h-4 mx-auto" src={`/images/icon/power_${isConnect ? 'on' : 'off'}.png`}/>
                </button>
                
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="lg:hidden hover:cursor-pointer py-1 ml-2">
                    <img className="w-7" src={'/images/icon/drawer.svg'}/>
                </button>
            </div>
            {
                dropdownOpen && 
                <div className="absolute right-4 mt-14 ml-2 py-2 w-32 bg-white rounded-md shadow-xl z-20">
                {/* <Link to="/" className="block px-4 py-2 text-sm capitalize text-gray-700 hover:bg-blue-500 hover:text-white">
                    Home
                </Link> */}
                <Link to="/exchange" className="block px-4 py-2 text-sm capitalize text-gray-700 hover:bg-blue-500 hover:text-white">
                    Exchange
                </Link>
                {/* <Link to="/futures" className="block px-4 py-2 text-sm capitalize text-gray-700 hover:bg-blue-500 hover:text-white">
                    Futures
                </Link> */}
                <Link to="/assets" className={`block px-4 py-2 text-sm capitalize text-gray-700 hover:bg-blue-500 hover:text-white ${!isConnect && 'text-gray-500'}`}>
                    Assets
                </Link>
                <Link to="/bridge" className="block px-4 py-2 text-sm capitalize text-gray-700 hover:bg-blue-500 hover:text-white">
                    Bridge
                </Link>
            </div>
            }
        </header>
    )
}

export default Header;