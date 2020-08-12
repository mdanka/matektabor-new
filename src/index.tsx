import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { createAppStore } from "./store";
import { BrowserRouter } from "react-router-dom";
import { initializeAndGetClientSideServices } from "./services";
import { Store } from 'redux';

const store = createAppStore();
initializeAndGetClientSideServices(store);

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App store={store as Store<any>} />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
