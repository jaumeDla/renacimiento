import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import axios from 'axios';

import Auth from './components/Auth';
import PassRecovery from './components/PassRecovery';
import PassChange from './components/PassChange';
import Wallet from './components/Wallet';

import './styles/general.css';
import './styles/auth.css'
import './styles/pass-recovery.css';
import './styles/wallet.css';

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkToken = async () => {
    try {
      const tokenAuth = localStorage.getItem('tokenAuth');
      await axios.post('/auth', { tokenAuth });
      setIsAuthenticated(true);
      setIsLoading(false)
    } catch (error) {
      console.log(error);
      setIsLoading(false)
    }
  }

  useEffect(() => {
    axios.defaults.baseURL = 'http://localhost:5000';
    checkToken();
  }, [])

  if (isLoading) return (<div className="lds-ring"><div></div><div></div><div></div><div></div></div>)

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/auth' element={isAuthenticated ? <Navigate to='/wallet' /> : <Auth />} />
        <Route path='/auth/pass-recovery' element={isAuthenticated ? <Navigate to='/wallet' /> : <PassRecovery />} />
        <Route path='/auth/pass-change' element={isAuthenticated ? <Navigate to='/wallet' /> : <PassChange />} />
        <Route path='/wallet' element={isAuthenticated ? <Wallet /> : <Navigate to='/auth' />} />
        <Route path='*' element={isAuthenticated ? <Navigate to='/wallet' /> : <Navigate to='/auth' />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
