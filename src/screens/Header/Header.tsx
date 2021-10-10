
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
import './Header.css'
const networkColor = {
    80001: '#53cbc9'
}
const Header = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { isConnect } = useSelector((state: RootState) => state.wallet);

    const onConnect = async () => {
        try {
            await onboard.walletSelect();
            await onboard.walletCheck();
        } catch(e) {
        }
        
    }

    useEffect(() => {
        setDropdownOpen(false);
        console.log(location)
    }, [location])

    const onDisConnect = () => {
        ////todo:: need bug
        onboard.walletReset();
        localStorage.removeItem('selectedWallet');
        dispatch(clearWallet());
        dispatch(clearBalances());
    }

    return (
        <header className="pb-5">
            <div className="corner flex">
                <a href="/">
                    <img className="w-9 h-9 lg:w-11 lg:h-11" alt="Logo"/>
                </a>
                <nav className="flex items-center w-0 justify-between lg:visible lg:w-auto lg:ml-4">
                    <ul>
                        {/* <li className="space-x-5 text-xl inline m-10">
                            <Link className="hidden sm:inline-block text-gray-700 hover:text-indigo-700" to="/">Home</Link>
                        </li> */}
                        <li className="text-xl font-bold inline m-4">
                            <Link className={`hidden lg:inline-block hover:text-blue-500 ${location.pathname === '/exchage' && 'text-blue-500'}`} to="/exchage">EXCHANGE</Link>
                        </li>
                        <li className="text-xl font-bold inline m-4">
                            <Link className={`hidden lg:inline-block hover:text-blue-500 ${location.pathname === '/futures' && 'text-blue-500'}`} to="/futures">PERPETUAL</Link>
                        </li>
                        <li className="text-xl font-bold inline m-4">
                            <Link className={`hidden lg:inline-block hover:text-blue-500 ${location.pathname === '/assets' && 'text-blue-500'}`} to="/assets">ASSESTS</Link>
                        </li>
                    </ul>
                </nav>
            </div>
            
            <div className="flex items-center h-9">
                {
                    isConnect ? 
                    <div className="flex bg-gray-700 h-full rounded-l-lg font-medium">
                        <div className="text-gray-400 my-auto mx-2">
                            <span>0x82AD...38C7</span>
                        </div>

                        <div className="transform rotate-45 my-auto">
                            <div className="bg-red-500 w-2 h-2"></div>
                        </div>

                        <div className="my-auto mx-2"><span>ETH</span></div>
                    </div> : <></>
                }
                
                <div className={`w-9 h-full mr-2 mt-0 bg-gray-500 ${isConnect ? 'rounded-r-lg' : 'rounded-lg'}`} onClick={() => onConnect()}>
                    <img className="w-3 h-full mx-auto" src={`/images/icon/power_${isConnect ? 'on' : 'off'}.svg`}/>
                </div>
                
                <div onClick={() => setDropdownOpen(!dropdownOpen)} className="sm:hidden hover:cursor-pointer py-1">
                    <img className="w-7" src={'/images/icon/drawer.svg'}/>
                </div>
            </div>
            {
                dropdownOpen && 
                <div className="absolute right-4 mt-14 py-2 w-32 bg-white rounded-md shadow-xl z-20">
                {/* <Link to="/" className="block px-4 py-2 text-sm capitalize text-gray-700 hover:bg-blue-500 hover:text-white">
                    Home
                </Link> */}
                <Link to="/exchage" className="block px-4 py-2 text-sm capitalize text-gray-700 hover:bg-blue-500 hover:text-white">
                    Exchage
                </Link>
                <Link to="/assets" className="block px-4 py-2 text-sm capitalize text-gray-700 hover:bg-blue-500 hover:text-white">
                    Assets
                </Link>
                <Link to="/futures" className="block px-4 py-2 text-sm capitalize text-gray-700 hover:bg-blue-500 hover:text-white">
                    Futures
                </Link>
                
            </div>
            }
        </header>
    )
}

export default Header;