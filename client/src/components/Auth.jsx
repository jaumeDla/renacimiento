import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

import image1 from '../assets/background-auth1.jpg';
import image2 from '../assets/background-auth2.jpg';
import image3 from '../assets/background-auth3.jpg';

const Auth = () => {

    //Sign up page authentication
    const [username_su, setUsername_su] = useState('');
    const [email_su, setEmail_su] = useState('');
    const [password_su, setPassword_su] = useState('');
    const [errorUsername_su, setErrorUsername_su] = useState('');
    const [errorEmail_su, setErrorEmail_su] = useState('');
    const [errorPassword_su, setErrorPassword_su] = useState('');
    const [state_su, setState_su] = useState(true);
    const [errorGeneral_su, setErrorGeneral_su] = useState('');

    const handleUsername_su = (event) => {
        const validation = /^[a-zA-Z0-9]{8,20}$/.test(event.target.value);
        (() => !validation || errorEmail_su || errorPassword_su || !email_su || !password_su ? setState_su(true) : setState_su(false))();
        setErrorUsername_su(!validation ? 'Username must contain between 8-20 characters and only numbers and letters' : '');
        setUsername_su(event.target.value);
    }

    const handleEmail_su = (event) => {
        const validation = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(event.target.value);
        (() => !validation || errorUsername_su || errorPassword_su || !username_su || !password_su ? setState_su(true) : setState_su(false))();
        setErrorEmail_su(!validation ? 'This email is not valid' : '');
        setEmail_su(event.target.value);
    }

    const handlePassword_su = (event) => {
        const validation = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(event.target.value);
        (() => !validation || errorUsername_su || errorEmail_su || !username_su || !email_su ? setState_su(true) : setState_su(false))();
        setErrorPassword_su(!validation ? 'Password must contain lowecase, uppercase and numbers' : '');
        setPassword_su(event.target.value);
    }

    const handleSubmit_su = async (event) => {
        event.preventDefault()
        try {
            const response = await axios.post('/auth/signup', { username: username_su, email: email_su, password: password_su });
            setErrorGeneral_su(response.data.message)
        } catch (error) {
            setErrorGeneral_su(error.response.data.message);
        }
    }

    //Sign in page authentication
    const [email_si, setEmail_si] = useState('');
    const [password_si, setPassword_si] = useState('');
    const [state_si, setState_si] = useState(true)
    const [errorGeneral_si, setErrorGeneral_si] = useState('');


    const handleEmail_si = (event) => {
        setEmail_si(event.target.value);
        event.target.value.trim() === '' || password_si.trim() === '' ? setState_si(true) : setState_si(false);
    }

    const handlePassword_si = (event) => {
        setPassword_si(event.target.value);
        event.target.value.trim() === '' || email_si.trim() === '' ? setState_si(true) : setState_si(false)
    }

    const handleSubmit_si = async (event) => {
        event.preventDefault()
        try {
            const response = await axios.post('/auth/signin', { email: email_si, password: password_si });
            window.localStorage.setItem('tokenAuth', response.data.tokenAuth)
            window.location.href = '/wallet';
        } catch (error) {
            setErrorGeneral_si(error.response.data.message)
        }
    }

    //Google authentication
    const handleSuccessGoogle = async (event) => {
        try {
            const { credential } = event;
            const response = await axios.post('/auth/google', { credential });
            window.localStorage.setItem('tokenAuth', response.data.tokenAuth)
            window.location.href = '/wallet';
        } catch (error) {
            setErrorGeneral_si(error.response.data.message);
            setErrorGeneral_su(error.response.data.message)
        }
    }

    const handleErrorGoogle = async (event) => {
        console.error('Google authentication is not available:', event);
    }

    //Dynamic page
    const [currentImage, setCurrentImage] = useState(0);
    const [showSignupForm, setShowSignupForm] = useState(true);
    const [intervalID, setIntervalID] = useState(null);

    const toggleForm = (type) => {
        setShowSignupForm(type === "signup");
    };

    const images = [image1, image2, image3];
    const imagesMap = images.map((image, index) => (
        <img key={index} className={`slide ${index === currentImage ? "active" : (index === (currentImage - 1 + images.length) % images.length ? "previous" : "")}`} src={image} />
    ));
    const dotsMap = images.map((_, index) => (
        <div key={index} className={`dot ${index === currentImage ? 'active' : ''}`} onClick={() => { setCurrentImage(index); resetInterval() }}></div>
    ))

    const changeImage = () => {
        setCurrentImage((prevImage) => (prevImage + 1) % images.length);
    };

    const resetInterval = () => {
        clearInterval(intervalID); 
        const interval = setInterval(changeImage, 10000); 
        setIntervalID(interval); 
    };

    useEffect(() => {
        const interval = setInterval(changeImage, 10000);
        setIntervalID(interval);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container-auth">
            <div className="content-left">
                <div className="slider">
                    {imagesMap}
                    <div className="slider-dots">
                        {dotsMap}
                    </div>
                </div>
            </div>
            <div className="content-right">
                <div className="content-signup" style={{ display: showSignupForm ? 'block' : 'none' }}>
                    <h1>Getting started!</h1>
                    <form className="form-signup">
                        <div className='controller'>
                            <input className={errorUsername_su ? 'error-input' : ''} onChange={handleUsername_su} type="text" placeholder="Choose your new username" />
                            {errorUsername_su && <FontAwesomeIcon icon={faExclamationCircle} className="error-icon" title={errorUsername_su} />}
                        </div>
                        <div className='controller'>
                            <input className={errorEmail_su ? 'error-input' : ''} onChange={handleEmail_su} type="email" placeholder="your-email@example.com" />
                            {errorEmail_su && <FontAwesomeIcon icon={faExclamationCircle} className="error-icon" title={errorEmail_su} />}
                        </div>
                        <div className='controller'>
                            <input className={errorPassword_su ? 'error-input' : ''} onChange={handlePassword_su} type="password" placeholder="Create a strong password" />
                            {errorPassword_su && <FontAwesomeIcon icon={faExclamationCircle} className="error-icon" title={errorPassword_su} />}
                        </div>
                        <div><button onClick={handleSubmit_su} disabled={state_su} type="submit">Sign up</button></div>
                        <div><label className='error'>{errorGeneral_su}</label></div>
                    </form>
                    <div className="divider"><label>or</label></div>
                    <div className="options">
                        <button>
                            <GoogleOAuthProvider clientId="351591539699-803aglb7vb3mo8r7cqn6pvqnk2r1p29j.apps.googleusercontent.com">
                                <GoogleLogin onSuccess={handleSuccessGoogle} onError={handleErrorGoogle} />
                            </GoogleOAuthProvider>
                        </button>
                        <button>Facebook</button>
                    </div>
                    <div className="altern">Already have an account? <a onClick={() => toggleForm('signin')}>Sign in</a></div>
                </div>
                <div className="content-signin" style={{ display: showSignupForm ? 'none' : 'block' }}>
                    <h1>Welcome back!</h1>
                    <form className="form-signin">
                        <div><input onChange={handleEmail_si} type="email" placeholder="your-email@example.com" /></div>
                        <div><input onChange={handlePassword_si} type="password" placeholder="Your password" /></div>
                        <div><a href="/auth/pass-recovery">Forgot password?</a></div>
                        <div><button onClick={handleSubmit_si} disabled={state_si} type="submit">Sign in</button></div>
                        <div><label>{errorGeneral_si}</label></div>
                    </form>
                    <div className="divider"><label>or</label></div>
                    <div className="options">
                        <button>
                            <GoogleOAuthProvider clientId="351591539699-803aglb7vb3mo8r7cqn6pvqnk2r1p29j.apps.googleusercontent.com">
                                <GoogleLogin onSuccess={handleSuccessGoogle} onError={handleErrorGoogle} />
                            </GoogleOAuthProvider>
                        </button>
                        <button>Facebook</button>
                    </div>
                    <div className="altern">Don't have an account yet? <a onClick={() => toggleForm('signup')}>Sign up</a></div>
                </div>
            </div>
        </div>

    );
};

export default Auth;