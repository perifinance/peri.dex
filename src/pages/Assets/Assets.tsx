import { useSelector } from "react-redux";
import { RootState } from "reducers";
import { useEffect, useState, useCallback } from "react";
// import { formatTimestamp } from "lib";

// import { NotificationManager } from "react-notifications";
import { getExchangeHistories } from "lib/thegraph/api";

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

    return (
        <div className="flex items-center lg:pt-5 mt-0 md:flex-row w-full lg:w-[95%] h-full lg:h-[85%] sm:justify-between lg:space-x-3">
            <div className="flex flex-col w-full h-full lg:w-[70%] m-2">
                <Trades histories={histories}/>
            </div>
            <Portfolio standAlone={false}/>
        </div>
    );
};

export default Assets;
