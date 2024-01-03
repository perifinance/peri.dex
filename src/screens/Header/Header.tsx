import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { RootState } from "reducers";
import { useSelector, useDispatch } from "react-redux";
import { clearWallet, clearBalances, updateIsConnect } from "reducers/wallet";
import { web3Onboard } from "lib/onboard";
import { changeNetwork, SUPPORTED_NETWORKS, isExchageNetwork, MAINNET, TESTNET } from "lib/network";
import "./Header.css";
import { networkInfo } from "configure/networkInfo";
import { resetBridgeStatus } from "reducers/bridge/bridge";
// import { get } from "http";
// const networkColor = {
//     80001: "#53cbc9",
// };

const Header = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const { address, networkId } = useSelector((state: RootState) => state.wallet);
    const [isMenuList, setIsMenuList] = useState(false);
    const { isConnect } = useSelector((state: RootState) => state.wallet);
    const [isNetworkList, setIsNetworkList] = useState(false);
    const [networks, setNetworks] = useState({});

    const getNetworkName = (networkId) => {
        return networkInfo[networkId] === undefined
            ? "Unsupported Network"
            : networkInfo[networkId].chainName;
    };

    const onConnect = async () => {
        try {
            await web3Onboard.connect(undefined);
        } catch (e) {}
    };

    const netRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const closeModalHandler = useCallback(
        (e) => {
            if (
                isNetworkList &&
                e.target.id !== "net_caller" &&
                !netRef.current?.contains(e.target)
            ) {
                setIsNetworkList(false);
            }

            if (
                isMenuList &&
                e.target.id !== "menu_caller" &&
                !menuRef.current?.contains(e.target)
            ) {
                setIsMenuList(false);
            }
        },
        [isMenuList, isNetworkList]
    );

    useEffect(() => {
        setIsMenuList(false);
    }, [location]);

    useEffect(() => {
        if (isNaN(networkId) || networkId === null) return;
        const networks = Object.keys(MAINNET).includes(networkId.toString()) ? MAINNET : TESTNET;
        setNetworks(networks);
        dispatch(resetBridgeStatus(networkId));
    }, [networkId]);

    const onDisConnect = () => {
        web3Onboard.disconnect();
        localStorage.removeItem("selectedWallet");
        dispatch(clearWallet());
        dispatch(clearBalances());
        dispatch(updateIsConnect(false));
        dispatch(resetBridgeStatus(networkId));
    };

    useEffect(() => {
        window.addEventListener("click", closeModalHandler);

        return () => {
            window.removeEventListener("click", closeModalHandler);
        };
    }, [closeModalHandler]);

    return (
        <header className="flex flex-row justify-between items-center h-[6%] sm:h-[10%] -mt-1 lg:mt-0 p-2">
            <div className="flex h-full items-center">
                <Link to="/">
                    <img
                        className="object-contain w-14 h-8 lg:w-20 lg:h-14"
                        src="/images/logo/logo.svg"
                        alt="Logo"
                    />
                </Link>
                <nav className="flex items-center w-0 justify-between lg:visible lg:w-auto lg:ml-4">
                    <ul>
                        {/* <li className="space-x-5 text-xl inline m-10">
                            <Link className="hidden sm:inline-block text-gray-700 hover:text-indigo-700" to="/">Home</Link>
                        </li> */}
                        <li key="0" className="text-xl font-bold inline m-4">
                            <Link
                                className={`hidden lg:inline-block hover:text-blue-600 ${
                                    location.pathname === "/exchange" && "text-blue-600"
                                }`}
                                to="/exchange"
                            >
                                EXCHANGE
                            </Link>
                        </li>
                        {/* <li className="text-xl font-bold inline m-4">
                            <Link className={`hidden lg:inline-block hover:text-blue-600 ${location.pathname === '/futures' && 'text-blue-600'}`} to="/futures">PERPETUAL</Link>
                        </li> */}
                        <li key="1" className="text-xl font-bold inline m-4">
                            <Link
                                className={`hidden lg:inline-block hover:text-blue-600 ${
                                    location.pathname === "/assets" && "text-blue-600"
                                }`}
                                to="/assets"
                            >
                                ASSETS
                            </Link>
                        </li>
                        <li key="2" className="text-xl font-bold inline m-4">
                            <Link
                                className={`hidden lg:inline-block hover:text-blue-600 ${
                                    location.pathname.includes("/bridge") && "text-blue-600"
                                }`}
                                to="/bridge/submit"
                            >
                                BRIDGE
                            </Link>
                        </li>
                        <li key="3" className="text-xl font-bold inline m-4">
                            <a
                                className={`hidden lg:inline-block hover:text-blue-600 ${
                                    location.pathname.includes("/dashboard") && "text-blue-600"
                                }`}
                                href="https://dashboard.peri.finance/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                DASHBOARD
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>

            <div className="flex flex-nowrap h-8 sm:h-9 cursor-pointer">
                {isConnect && (
                    <div
                        id="net_caller"
                        className={`flex items-center bg-gray-700 text-base shadow-sm shadow-slate-400/50 ${
                            isNetworkList ? "rounded-b-none" : "rounded-l-lg"
                        } hover:shadow-slate-300/70  active:shadow-inner active:shadow-slate-700`}
                        onClick={() => setIsNetworkList(!isNetworkList)}
                    >
                        <div className="relative m-1 ">
                            <button
                                id="net_caller"
                                className="block self-center bg-gray-700  rounded "
                            >
                                <img
                                    id="net_caller"
                                    className="w-5 h-5 m-1 self-center rounded object-scale-down"
                                    src={`/images/network/${
                                        SUPPORTED_NETWORKS[networkId] &&
                                        (!location.pathname.includes("/exchange") ||
                                            isExchageNetwork(networkId))
                                            ? networkId
                                            : "unsupported"
                                    }.svg`}
                                    alt="network"
                                />
                            </button>
                            <div
                                className={`absolute top-0 left-0 rounded-b-md bg-gray-700 shadow-sm shadow-slate-600 hover:shadow-slate-300/70 px-3 -mx-1 mt-9 ${
                                    isNetworkList ? "block" : "hidden"
                                } text-sm z-40`}
                                ref={netRef}
                            >
                                <ul className="w-min py-1">
                                    {Object.keys(networks).map((key) => (
                                        <li
                                            className="w-full"
                                            key={key}
                                            onClick={() => {
                                                changeNetwork(key);
                                                setIsNetworkList(false);
                                                dispatch(resetBridgeStatus(networkId));
                                            }}
                                        >
                                            <div
                                                className={`inline-flex grow items-center py-2 pr-8 hover:bg-black-900 cursor-pointer ${
                                                    Number(key) === networkId && "bg-black-900"
                                                }`}
                                            >
                                                <img
                                                    className="w-5 h-5 rounded-full pr-1"
                                                    src={`/images/network/${key}.svg`}
                                                    alt="network"
                                                ></img>
                                                <span className="block text-sm">
                                                    {getNetworkName(key)}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div
                            id="net_caller"
                            className="flex bg-transparent rounded-l-lg text-base "
                        >
                            {SUPPORTED_NETWORKS[networkId] && (
                                <div
                                    id="net_caller"
                                    className={`text-gray-400 font-medium text-sm mr-2 my-auto `}
                                >
                                    {
                                        /* location.pathname.includes("/bridge") ||
                                isExchageNetwork(networkId)
                                    ?  */ address &&
                                            address.slice(0, 6) +
                                                "..." +
                                                address.slice(-4, address.length)
                                        /*  : "" */
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* <div id="dropdownNetList" className="z-10 hidden bg-white rounded-lg shadow w-60 dark:bg-gray-700">
                    <ul className="h-48 py-2 overflow-y-auto text-gray-700 dark:text-gray-200" aria-labelledby="dropdownUsersButton">
                        <li>
                        <a href="#" className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                            <img className="w-6 h-6 mr-2 rounded-full" src="/docs/images/people/profile-picture-1.jpg" alt="Jese image"/>
                            Jese Leos
                        </a>
                        </li>
                    </ul>
                </div> */}

                <button
                    className={`w-9 h-full mt-0 bg-gray-700 shadow-sm shadow-slate-400/50
                        hover:shadow-slate-300/70 active:shadow-inner active:shadow-slate-700 " ${
                            isConnect ? "rounded-r-lg" : "rounded-lg"
                        }`}
                    onClick={() => (isConnect ? onDisConnect() : onConnect())}
                >
                    <img
                        className="w-4 h-4 mx-auto"
                        alt="Connect Button"
                        src={`/images/icon/power_${isConnect ? "on" : "off"}.png`}
                    />
                </button>

                <div className="flex relative">
                    <button
                        id="menu_caller"
                        onClick={() => setIsMenuList(!isMenuList)}
                        className="lg:hidden  rounded-lg hover:cursor-pointer pt-1 ml-3"
                    >
                        <img
                            id="menu_caller"
                            className="w-6 z-0"
                            alt="Toggle Dropdown Menu"
                            src={"/images/icon/drawer.svg"}
                        />
                    </button>
                    {isMenuList && (
                        <div
                            className="absolute top-9 right-0 ml-2 py-2 w-32 bg-gray-700 rounded-md shadow-md shadow-slate-500 z-50"
                            ref={menuRef}
                        >
                            {/* <Link to="/" className="block px-4 py-2 text-sm capitalize text-gray-700 hover:bg-blue-600 hover:text-inherent">
                                Home
                            </Link> */}
                            <Link
                                to="/exchange"
                                className="block px-4 py-2 text-sm capitalize text-gray-200 hover:bg-blue-600 hover:text-inherent"
                            >
                                Exchange
                            </Link>
                            {/* <Link to="/futures" className="block px-4 py-2 text-sm capitalize text-gray-700 hover:bg-blue-600 hover:text-inherent">
                            Futures
                        </Link> */}
                            <Link
                                to="/assets"
                                className={`block px-4 py-2 text-sm capitalize text-gray-200 hover:bg-blue-600 hover:text-inherent`}
                            >
                                Orders
                            </Link>
                            <Link
                                to="/portfolio"
                                className={`block px-4 py-2 text-sm capitalize text-gray-200 hover:bg-blue-600 hover:text-inherent`}
                            >
                                Portfolio
                            </Link>
                            <Link
                                to="/bridge"
                                className="block px-4 py-2 text-sm capitalize text-gray-200 hover:bg-blue-600 hover:text-inherent"
                            >
                                Bridge
                            </Link>
                            <a
                                href="https://dashboard.peri.finance/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block px-4 py-2 text-sm capitalize text-gray-200 hover:bg-blue-600 hover:text-inherent"
                            >
                                Dashboard
                            </a>
                        </div>
                    )}
                </div>
                
            </div>
            
        </header>
    );
};

export default Header;
