import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Auth0Provider } from '@auth0/auth0-react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
      
      <Auth0Provider
    domain="dev-76dvlq81pcfozwnq.us.auth0.com"
    clientId="uBWhYTpohQhIqSKtzTpTJcj5gJKEsXA9"
    authorizationParams={{
      audience: "server-secret-id",
      redirect_uri: window.location.origin
    }}
    useRefreshTokens = {true}
    cacheLocation='localstorage'
  >
    <App />
  </Auth0Provider>,
      
    </React.StrictMode>
);

