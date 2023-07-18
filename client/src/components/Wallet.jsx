import React from 'react'
import { useState, useEffect } from "react";
import axios from 'axios'

const Wallet = () => {
  const [wallet, setWallet] = useState('')
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(true);

  const walletAmount = async () => {
    const tokenAuth = window.localStorage.getItem('tokenAuth');
    const response = await axios.post('/wallet', { tokenAuth });
    setWallet(response.data.wallet)
  }

  useEffect(() => {
    walletAmount();
  }, [])

  const handleAmount = (event) => {
    if (/^(?!0+$)(?!0\d)\d{1,3}(?<!\.)$/.test(event.target.value) || event.target.value === '') {
      setAmount(event.target.value);
      setError(false)
    }
  }

  const handlePayment = async (event, labelAmount) => {
    event.preventDefault();

    try {
      const tokenAuth = window.localStorage.getItem('tokenAuth');
      const response = await axios.post('/wallet/payment', { tokenAuth, amount: labelAmount });
      window.location.href = response.data.url;
    } catch (error) {
      console.log(error)
    }
  }

  const handleLogout = (event) => {
    event.preventDefault()
    window.localStorage.removeItem('tokenAuth');
    window.location.href = '/auth/signin';
  }

  return (
    <div className='container-wallet'>
      <dir className='container'>
        <div className='container-arrow'>
          <a href="/dashboard" className='back-link'>
            <span className='arrow'></span>
            <span className='back-text'>Return</span>
          </a>
        </div>
        <div><h1 className='title'>Amount: {wallet}€</h1></div>
        <div className='container-buttons'>
          <button className='button-amount' onClick={event => handlePayment(event, 1)}>1€</button>
          <button className='button-amount' onClick={event => handlePayment(event, 2)}>2€</button>
          <button className='button-amount' onClick={event => handlePayment(event, 5)}>5€</button>
          <button className='button-amount' onClick={event => handlePayment(event, 10)}>10€</button>
        </div>
        <div className='container-recharge'>
          <label className='label' htmlFor="amount"></label>
          <input onChange={handleAmount} value={amount} />
          <button className="button-recharge" onClick={!error ? (event) => handlePayment(event, amount) : null}>Recharge</button>
        </div>
        <div className='container-logout'>
          <button className='button-logout' onClick={handleLogout}>Log out</button>
        </div>
      </dir>
    </div>
  )
}

export default Wallet;