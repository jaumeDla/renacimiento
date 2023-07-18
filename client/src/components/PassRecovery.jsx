import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const PassRecovery = () => {
    const [email, setEmail] = useState('');
    const [errorEmail, setErrorEmail] = useState('');
    const [errorGeneral, setErrorGeneral] = useState('');
    const [state, setState] = useState(true);

    const handleEmail = (event) => {
        const validation = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(event.target.value);
        setState(!validation);
        setErrorEmail(validation ? '' : 'This email is not valid');
        setEmail(event.target.value);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('/auth/pass-recovery', { email });
            setErrorGeneral(response.data.message);
        } catch (error) {
            setErrorGeneral(error.response.data.message);
        }
    }

    return (
        <div className="container-pass-recovery">
            <div className="content-pass-recovery">
                <div className="content-arrow">
                    <a href="/auth" className="back-link">
                        <span className="arrow"></span>
                        <span className="back-text">Return</span>
                    </a>
                </div>
                <div className="divider">
                    <h1>I forgot my password</h1>
                </div>
                <form className="form-pass-recovery" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Write your email to receive a recovery password message</label>
                    </div>
                    <div className="controller">
                        <input
                            className={errorEmail ? 'error-input' : ''}
                            onChange={handleEmail}
                            type="email"
                            placeholder="Email"
                            id="email"
                            value={email}
                        />
                        {errorEmail && <FontAwesomeIcon icon={faExclamationCircle} className="error-icon" title={errorEmail} />}
                    </div>
                    <div>
                        <button type="submit" disabled={state}>Recover my password</button>
                    </div>
                    <div className={errorGeneral ? 'error-label' : ''}>
                        <label>{errorGeneral}</label>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PassRecovery;
