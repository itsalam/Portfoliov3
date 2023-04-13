import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { extendTheme, VechaiProvider } from '@vechaiui/react';
import theme from './themes';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
