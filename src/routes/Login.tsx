import React from 'react';

import auth from '../models/auth';
import { api_url } from '../models/config';

import Form from '../components/Form';

import '../style/Login.css';

interface Props {
    onLogin: () => void
}

class Login extends Form<Props> {
    onSubmit(data: Record<string, unknown>) : void {
        console.log(data);

        fetch(`${api_url}/authorize`, {
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
                    <label htmlFor="id">ID</label>
                    <input type="text" name="id" id="id" onChange={this.handleChange} />

                    <label htmlFor="key">Key</label>
                    <input type="password" name="key" id="key" onChange={this.handleChange} />
                    <input type="submit" value="Authorize" />
                </form>
            </div>
        );
    }
}

export default Login;
