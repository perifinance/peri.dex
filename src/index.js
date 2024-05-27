
import React, { Suspense, useEffect } from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from './store';
import reportWebVitals from './reportWebVitals';
import { Web3OnboardProvider, /* initOnboard */ } from 'lib/onboard';
import App from './App';
import './index.css';


const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
// let onboard = initOnboard('dark', false);

root.render(
    <Web3OnboardProvider /* provider={onboard} */>
    <Suspense fallback={<div />}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor} >
              <App />
          </PersistGate> 
        </Provider>
    </Suspense>
    </Web3OnboardProvider>

);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
