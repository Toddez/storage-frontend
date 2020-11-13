import React from 'react';

import auth from '../models/auth';
import { api_url } from '../models/config';

import Form from '../components/Form';

class Login extends Form {
    constructor(props: Record<string, unknown>) {
        super(props);
    }

    onSubmit(data: Record<string, unknown>) : void {
        console.log(data);
    }

    render() : JSX.Element {
        return (
            <div>
                <form onSubmit={this.handleSubmit} >
                    <input type="text" name="a" id="a" onChange={this.handleChange} />
                    <input type="text" name="b" id="b" onChange={this.handleChange} />
                    <input type="submit" value="Submit!" />
                </form>
            </div>
        );
    }
}

export default Login;
