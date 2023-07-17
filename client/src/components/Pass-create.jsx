import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const url = new URL(window.location.href);
const token = url.searchParams.get('tokenRecovery');

const PassCreate = () => {

    const [password1, setPassword1] = useState('')
    const [password2, setPassword2] = useState('')
    const [errorPassword, setErrorPassword] = useState('')
    const [state, setState] = useState(true)

    const handlePassword1 = (event) => {
        const validation = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z])[a-zA-Z0-9]{8,20}$/.test(event.target.value);
        (() => !validation || password2 === '' ? setState(true) : setState(false))();
        setErrorPassword(!validation ? 'Password must contain lowecase, uppercase and numbers' : '');
        setPassword1(event.target.value)
    }

    const handlePassword2 = (event) => {
        const validation = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z])[a-zA-Z0-9]{8,20}$/.test(event.target.value);
        (() => !validation || password1 === ''  ? setState(true) : setState(false))();
        setErrorPassword(!validation ? 'Password must contain lowecase, uppercase and numbers' : '');
        setPassword2(event.target.value)
    }


    const handleSubmit = async (event) => {
        event.prevendtDefault();
        try{
            if(password1 === password2){
                const response = await axios.post('/auth/pass-create', {password: password1, tokenRecovery: token})
                console.log(response.data.message)
            }else{
                setErrorPassword('The password is not the same in the two inputs')
            }

        }catch(error){
            console.log(error.response.data.message)
        }
     
    }

    return (
        <div className="container-pass-create">
            <div className="content-pass-create">
                <div className="content-arrow">
                    <a href="/auth" className="back-link">
                        <span className="arrow"></span>
                        <span className="black-text">Return</span>
                    </a>
                </div>
                <div className="divider"></div><h1>I forgot my password</h1>
                <form className="form-pass-create" onSubmit={handleSubmit}>
                    <div><label htmlFor="password">Write here your new strong password </label></div>
                    <div className="controller">
                        <input className={errorPassword ? 'error-input' : ''} onChange={handlePassword1} id="password" placeholder="Password" value={password1} />
                        {errorPassword && <FontAwesomeIcon icon={faExclamationCircle} className="error-icon" title={errorPassword} />}
                    </div>
                    <div className="controller">
                        <input className={errorPassword ? 'error-input' : ''} onChange={handlePassword2} id="password" placeholder="Repeat your password" value={password2} />
                        {errorPassword && <FontAwesomeIcon icon={faExclamationCircle} className="error-icon" title={errorPassword} />}
                        <label>{setErrorPassword}</label>
                    </div>
                    <div><button type="submit" disabled={state}>Create password</button></div>
                </form>
            </div>
        </div>
    )
}

export default PassCreate