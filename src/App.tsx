import React, { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from "react-redux"
import { NotificationContainer, NotificationManager } from 'react-notifications';
// import { getLastRates, getBalances } from 'lib/thegraph/api'
import { RootState } from 'reducers'
import detectEthereumProvider from '@metamask/detect-provider';

import { updateAddress, updateNetwork, updateIsConnect } from 'reducers/wallet'
// import { clearWallet, clearBalances } from 'reducers/wallet'
import { resetTransaction } from 'reducers/transaction'
import { initCoinList } from 'reducers/coin/coinList'
import { setSourceCoin, setDestinationCoin } from 'reducers/coin/selectedCoin'
import { setAppReady } from 'reducers/app'
// import { changeNetwork } from 'lib/network'

import { SUPPORTED_NETWORKS } from 'lib/network'
import { InitOnboard, onboard } from 'lib/onboard/onboard'
import { contracts } from 'lib/contract'
import { getCoinList } from 'lib/coinList'

import Main from './screens/Main'
import './App.css'


const App = () => {
  const { address, networkId } = useSelector((state: RootState) => state.wallet);
  const transaction = useSelector((state: RootState) => state.transaction);
  const themeState = useSelector((state: RootState) => state.theme.theme);
  
  const dispatch = useDispatch();
  
  const setOnboard = async () => {
    
    let networkId = 1285;//Number(process.env.REACT_APP_DEFAULT_NETWORK_ID);
    try {
      // @ts-ignore
      networkId = Number((await detectEthereumProvider()).networkVersion);
    } catch(e) {

    }

    // console.log('networkId', networkId);
    
    contracts.init(networkId);
    dispatch(setAppReady());
    dispatch(updateNetwork({networkId: networkId}));
    try{ 
      InitOnboard(networkId, {
        wallet: async wallet => {
          if (wallet.provider) {
            contracts.wallet = wallet;
            localStorage.setItem('selectedWallet', wallet.name);
          } else {
            contracts.clear();
          }
        },
        address:async (newAddress) => {
          if(newAddress) {
            contracts.connect(newAddress);
            dispatch(updateIsConnect(true));
            dispatch(updateAddress({address: newAddress}));
          }
        },
        network: async (network) => {
            if(network) {
              contracts.init(network);
              onboard.config({ networkId: network });
              
              dispatch(updateNetwork({networkId: network}));
              if(SUPPORTED_NETWORKS[network]) {
                contracts.connect(address);
              } else {
                // NotificationManager.warning(`This network is not supported. Please change to moonbase network`, 'ERROR');
                // onboard.walletReset();
                // onboard.config({ networkId: network });
                dispatch(updateNetwork({networkId: network}));
                // dispatch(updateIsConnect(false));
                // localStorage.removeItem('selectedWallet');
                // dispatch(clearWallet());
                // changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID)
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
  }

  const getState = useCallback(async () => {
    await contracts.provider.once(transaction.hash, async (transactionState) => {
      if(transactionState.status !== 1) {
        NotificationManager.remove(NotificationManager.listNotify[0])
        NotificationManager.warning(`${transaction.type} error`, 'ERROR');
      } else {
        NotificationManager.remove(NotificationManager.listNotify[0])
        NotificationManager.success(`${transaction.type} success`, 'SUCCESS');
        if(transaction.action) {
          await transaction.action();
        }
        dispatch(resetTransaction());
      }
    });
  }, [transaction, dispatch])

  useEffect(() => {
    if(transaction.hash) {
      
      getState();
      NotificationManager.info(transaction.message, 'In progress', 1000000);
    }
  }, [getState, transaction])

  useEffect(() => {
    setOnboard();
    if(themeState === 'dark') {
      document.getElementsByTagName('html')[0].classList.add('dark');
    }
    // eslint-disable-next-line
  }, []);

  const init = useCallback(() => {    
      try {
        const coinList = getCoinList(networkId);
        dispatch(initCoinList(coinList));
        dispatch(setSourceCoin(coinList[0]));
        dispatch(setDestinationCoin(coinList[1]));
      } catch(e) {
    }
        
  },[networkId, dispatch])
  
  useEffect(() => {
    if(networkId) {
      init();
    }
  }, [init, networkId]);
  
  return (
    <div>
      {/* <Loading></Loading> */}
      <Main></Main>
      <NotificationContainer/>
    </div>
  );
}



export default App;