import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';



const PassRecovery = () => {

    const [email, setEmail] = useState('')
    const [errorEmail, setErrorEmail] = useState('')
    const [errorGeneral, setErrorGeneral] = useState('')
    const [state, setState] = useState(true)

    const handleSubmit = async (event) => {
        event.preventDefault();
        try{
            const response = await axios.post('/auth/pass-recovery', {email});
            setErrorGeneral(response.data.message)
            console.log(response.data.message)
        }catch(error){
            setErrorGeneral(error.response.data.message)
            console.log(error.response.data.message)
        }
        console.log(email)
    }

    const handleEmail = (event) => {
        const validation = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(event.target.value);
        (() => !validation  ? setState(true) : setState(false))();
        setErrorEmail(!validation ? 'This email is not valid' : '');
        setEmail(event.target.value);

    }

    return (
        <div className="container-pass-recovery">
            <div className="content-pass-recovery">
                <div className="content-arrow">
                    <a href="/auth" className="back-link">
                        <span className="arrow"></span>
                        <span className="black-text">Return</span>
                    </a>
                </div>
                <div className="divider"></div><h1>I forgot my password</h1>
                <form className="form-pass-recovery" onSubmit={handleSubmit}>
                    <div><label htmlFor="email">Write here your email to receive a recovery message </label></div>
                    <div className="controller">
                        <input className={errorEmail ? 'error-input': ''} onChange={handleEmail} id="email" placeholder="your-email@example.com" value={email} />
                        {errorEmail && <FontAwesomeIcon icon={faExclamationCircle} className="error-icon" title={errorEmail} />}
                    </div>
                    <div><button type="submit" disabled={state}>Send email</button></div>
                    <div className="error-label"><label>{errorGeneral}</label></div>
                </form>
            </div>
        </div>
    )
}

export default PassRecovery