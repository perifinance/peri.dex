import React, { Suspense } from 'react';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from './store';
// import './i18n';
import 'react-notifications/lib/notifications.css';
import './index.css';

const container = document.getElementById('root');
// const root = createRoot(container); // createRoot(container!) if you use TypeScript

ReactDOM.render(
  <Suspense fallback={<div />}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </Suspense>,
  container
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
