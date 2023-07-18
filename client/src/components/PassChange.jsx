import React, { useState } from "react";
import axios from 'axios';

const PassChange = () => {

    const [email, setEmail] = useState('')

    const handleEmail = (event) => {
        setEmail(event.target.value)
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await axios.post('/auth/pass-change', { email }, { withCredentials: true });
            window.location.href = '/auth';
        } catch (error) {
            console.error(error.response.data.message)
        }
    }

    return (
        <div className="pass-change">
            <div className="container">
                <form onSubmit={handleSubmit}>
                    <input onChange={handleEmail} placeholder="Email" value={email} />
                    <button>Change my password</button>
                </form>
            </div>
        </div>
    )
}

export default PassChange;