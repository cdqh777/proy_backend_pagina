import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#4A413C',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#BB6C43', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
);
