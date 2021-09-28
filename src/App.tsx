import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from "react-redux"
import { NotificationContainer, NotificationManager } from 'react-notifications';

import { RootState } from 'reducers'
import detectEthereumProvider from '@metamask/detect-provider';

import { updateAddress, updateNetwork, updateIsConnect } from 'reducers/wallet'
import { clearWallet, clearBalances } from 'reducers/wallet'
import { resetTransaction } from 'reducers/transaction'
import { initCoinList } from 'reducers/coin/coinList'
import { setSourceCoin, setDestinationCoin } from 'reducers/coin/selectedCoin'
import { setAppReady } from 'reducers/app'

import { SUPPORTED_NETWORKS } from 'lib/network'
import { InitOnboard, onboard } from 'lib/onboard/onboard'

import { contracts } from 'lib/contract'
import { getCoinList } from 'lib/coinList'

// import Loading from './screens/Loading'
import Main from './screens/Main'
import './App.css'


const App = () => {
    const { address, networkId } = useSelector((state: RootState) => state.wallet);
    const transaction = useSelector((state: RootState) => state.transaction);
    
    const themeState = useSelector((state: RootState) => state.theme.theme);
    
    const dispatch = useDispatch();

    const setOnbaord = async () => {
        
        let networkId = Number(process.env.REACT_APP_DEFAULT_NETWORK_ID);
        try {
            // @ts-ignore
            networkId = Number((await detectEthereumProvider()).networkVersion);
        } catch(e) {

        }
        
        contracts.init(networkId);
        dispatch(updateNetwork({networkId: networkId}));
        try{ 
            InitOnboard(networkId, {
                wallet: async wallet => {
                    if (wallet.provider) {
                        contracts.wallet = wallet;
                        localStorage.setItem('selectedWallet', wallet.name);
                    }
                },
                address:async (newAddress) => {
                    if(newAddress) {
                        if(SUPPORTED_NETWORKS[onboard.getState().network]) {
                            contracts.connect(newAddress);
                            dispatch(clearBalances());
                            dispatch(updateAddress({address: newAddress}));                    
                            dispatch(updateIsConnect(true));
                        } else {
                            onboard.walletReset();
                        }
                    }
                },
                network: async (network) => {
                        if(network) {
                            if(SUPPORTED_NETWORKS[network]) {
                                contracts.init(network);                    
                                onboard.config({ networkId: network });
                                dispatch(updateNetwork({networkId: network}));
                                contracts.connect(address);
                    
                            } else {
                                NotificationManager.warning(`This network is not supported. Please change to bsc or polygon or ethereum network`, 'ERROR');
                                onboard.walletReset();
                                onboard.config({ networkId: network });
                                dispatch(updateNetwork({networkId: network}));
                                dispatch(updateIsConnect(false));
                                localStorage.removeItem('selectedWallet');
                                dispatch(clearWallet());
                                dispatch(clearBalances());
                            }
                        }
                    },
                }, 
            themeState === 'dark' );
        } catch(e) {
            console.log(e);
            localStorage.clear();
            // window.location.reload()
        }
        const selectedWallet = localStorage.getItem('selectedWallet');
        
        if(selectedWallet) {
            try {
                await onboard.walletSelect(selectedWallet);
                await onboard.walletCheck();
            } catch(e) {
                console.log(e);
            }
        }
        dispatch(setAppReady());
    }

    useEffect(() => {
        if(transaction.hash) {
            const getState = async () => {
                await contracts.provider.once(transaction.hash, async (transactionState) => {
                    if(transactionState.status !== 1) {
                        NotificationManager.remove(NotificationManager.listNotify[0])
                        NotificationManager.warning(`${transaction.type} error`, 'ERROR');
                    } else {
                        NotificationManager.remove(NotificationManager.listNotify[0])
                        NotificationManager.success(`${transaction.type} success`, 'SUCCESS');
                        dispatch(resetTransaction());
                    }
                });
            }
            getState();
            NotificationManager.info(transaction.message, 'In progress', 0);
        }
    }, [transaction])

    useEffect(() => {
        setOnbaord();
        if(themeState === 'dark') {
            document.getElementsByTagName('html')[0].classList.add('dark');
        }
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if(networkId) {
            const coinList = getCoinList(networkId);
            dispatch(initCoinList(coinList));
            dispatch(setSourceCoin(coinList[0]));
            dispatch(setDestinationCoin(coinList[1]));
        }
    }, [networkId]);
    
    
    return (
        <>
            {/* <Loading></Loading> */}
            <Main></Main>
            <NotificationContainer/>
        </>

    );
}



export default App;