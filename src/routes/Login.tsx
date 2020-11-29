import React from 'react';

import auth from '../models/auth';
import { apiUrl } from '../models/config';

import Form from '../components/Form';

import '../style/Login.css';

interface Props {
    onLogin: () => void
}

class Login extends Form<Props> {
    onSubmit(data: Record<string, unknown>) : void {
        fetch(`${apiUrl}/authorize`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                id: data.id,
                key: data.key
            })
        })
            .then((res) => res.json())
            .then((res) => {
                // TODO: display errors
                if (res.errors)
                    return;

                auth.setToken(res.data.token);
                this.props.onLogin();
            });
    }

    render() : JSX.Element {
        return (
            <div className='Login'>
                <form onSubmit={this.handleSubmit} >
                    <div className='input-section'>
                        <input type='text' name='id' id='id' onChange={this.handleChange} required autoFocus />
                        <label htmlFor='id'><span className='label-text'>ID</span></label>
                    </div>

                    <div className='input-section'>
                        <input type='password' name='key' id='key' onChange={this.handleChange} required />
                        <label htmlFor='key'><span className='label-text'>Key</span></label>
                    </div>

                    <input type='submit' value='Authorize' hidden />
                </form>
            </div>
        );
    }
}

export default Login;
