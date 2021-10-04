
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
    }, [location])

    const onDisConnect = () => {
        ////todo:: need bug
        onboard.walletReset();
        localStorage.removeItem('selectedWallet');
        dispatch(clearWallet());
        dispatch(clearBalances());
    }

    return (
        <header>
            <div className="corner">
                <a href="/">
                    <img alt="Logo"/>
                </a>
            </div>
            <nav className="flex items-center w-0 justify-between sm:visible sm:w-auto">
                <ul>
                    {/* <li className="space-x-5 text-xl inline m-10">
                        <Link className="hidden sm:inline-block text-gray-700 hover:text-indigo-700" to="/">Home</Link>
                    </li> */}
                    <li className="space-x-5 text-xl inline m-10">
                        <Link className="hidden sm:inline-block text-gray-700 hover:text-indigo-700" to="/exchage">Exchage</Link>
                    </li>
                    <li className="space-x-5 text-xl inline m-10">
                        <Link className="hidden sm:inline-block text-gray-700 hover:text-indigo-700" to="/futures">Futures</Link>
                    </li>
                    <li className="space-x-5 text-xl inline m-10">
                        <Link className="hidden sm:inline-block text-gray-700 hover:text-indigo-700" to="/assets">Assets</Link>
                    </li>
                </ul>
            </nav>
            
            <div className="flex py-4">
                {isConnect ? 
                    (
                        <button className="bg-gray-800 hover:bg-gray-900 text-white text-sm px-4 py-2 rounded-full">
                            <div className="flex items-center">
                                <span className="text-gray-400">0x82….8C7</span>
                                <img className="w-4 h-4 mx-2" src="/logo/logo.png" alt="network"/>
                                <span className="text-gray-200">ETH</span>
                            </div>
                        </button>
                    ) :
                    (
                        <button className="bg-gray-800 hover:bg-gray-900 text-white text-sm px-4 py-2 rounded-full" onClick={() => onConnect()}>
                            CONNECT
                        </button>
                    )
                }
            </div>
            
            <div className="corner">
                <div onClick={() => setDropdownOpen(!dropdownOpen)} className="sm:hidden space-y-2 hover:cursor-pointer py-5">
                    <span className="w-10 h-1 bg-gray-400 rounded-full block"></span>
                    <span className="w-10 h-1 bg-gray-400 rounded-full block"></span>
                    <span className="w-10 h-1 bg-gray-400 rounded-full block"></span>
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