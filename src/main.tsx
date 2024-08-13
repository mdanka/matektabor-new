// Had to add this import per https://github.com/vitejs/vite/issues/12423#issuecomment-2080351394
import '@mui/material/styles/styled';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss';
import App from './app';
import * as serviceWorker from './serviceWorker';
import { createAppStore } from "./store";
import { BrowserRouter } from "react-router-dom";
import { Store } from 'redux';

const store = createAppStore();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App store={store as Store<any>} />
    </BrowserRouter>
  </StrictMode>,
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
