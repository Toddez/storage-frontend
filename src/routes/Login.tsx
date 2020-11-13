import React from 'react';

import auth from '../models/auth';
import { api_url } from '../models/config';

import Form from '../components/Form';

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
            <div>
                <form onSubmit={this.handleSubmit} >
                    <input type="text" name="id" id="id" onChange={this.handleChange} />
                    <input type="text" name="key" id="key" onChange={this.handleChange} />
                    <input type="submit" value="Submit!" />
                </form>
            </div>
        );
    }
}

export default Login;
