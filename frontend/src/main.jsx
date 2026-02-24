import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import Landing from './pages/Landing.jsx';
import { Theme } from './components/Theme';
import { Intro } from './components/Intro';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Theme>
        <App />
        <Intro/>
      </Theme>
    </BrowserRouter>
  </React.StrictMode>,
);
