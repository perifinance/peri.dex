import { useSelector } from "react-redux";
import { RootState } from "reducers";
import { useEffect, useState, useCallback } from "react";
// import { formatTimestamp } from "lib";

// import { NotificationManager } from "react-notifications";
import { getExchangeHistories } from "lib/thegraph/api";
// import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
// import pynths from "configure/coins/pynths";
import { isExchageNetwork } from "lib/network";
import Portfolio from '../Portfolio/Portfolio';
import Trades from "./Trades";

/* const useDidMountEffect = (func: any, deps: Array<any>) => {
    const didMount = useRef(false);

    useEffect(() => {
        if (didMount.current) func();
        else didMount.current = true;
    }, deps);
};
 */
const Assets = () => {
    // const { isReady } = useSelector((state: RootState) => state.app);
    // const { coinList } = useSelector((state: RootState) => state.coinList);
    const { address, networkId, isConnect } = useSelector((state: RootState) => state.wallet);
    const transaction = useSelector((state: RootState) => state.transaction);
	const [histories, setHistories] = useState([]);
    
    /* const [searchOptions, setSearchOptions] = useState<{
        startDate?: Date;
        endDate?: Date;
        src?: String;
        dest?: String;
        action?: String;
    }>({}); */

    /*     useDidMountEffect(() => {
        if (isReady && coinList && address && isConnect) {
            if (!isExchageNetwork(networkId)) {
                NotificationManager.warning(`This network is not supported. Please try another network`);
                // changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID);
            }
        }
    }, [searchOptions]); */


    const getHistory = useCallback(async () => {
        
        const histories = await getExchangeHistories({ address, first: 1000 });
        // NotificationManager.warning(`History is loading...${histories.length}`);
        setHistories(histories);
    }, [address, getExchangeHistories, setHistories]);

    useEffect(() => {
        if (address && !transaction.hash) {
            if (isExchageNetwork(networkId)) {
                getHistory();
            } else {
                // changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID);
                setHistories([]);
            }
        }
    }, [address, transaction, networkId]);

    useEffect(() => {
        if (!isConnect) {
            setHistories([]);
        }
    }, [isConnect]);

/* 
    const receiveRef = useRef<HTMLDivElement>(null);
    const destRef = useRef<HTMLDivElement>(null);
    const actionRef = useRef<HTMLDivElement>(null);

    const closeModalHandler = useCallback(
        (e) => {
            if (isDestCoinList && !destRef.current.contains(e.target)) {
                setIsDestCoinList(false);
            }

            if (isSrcCoinList && !receiveRef.current.contains(e.target)) {
                setIsSrcCoinList(false);
            }

            if (isActionList && !actionRef.current.contains(e.target)) {
                setIsActionList(false);
            }
        },
        [isActionList, isDestCoinList, isSrcCoinList]
    );
 */
/*     useEffect(() => {
        window.addEventListener("click", closeModalHandler);

        return () => {
            window.removeEventListener("click", closeModalHandler);
        };
    }, [closeModalHandler]); */

    return (
        <div className="flex flex-col-reverse items-center md:flex-row w-full h-fit sm:justify-between">
            <Trades histories={histories}/>
            <Portfolio standAlone={false}/>
        </div>
    );
};

export default Assets;
