import React from 'react';
import { BrowserRouter as Router, NavLink, Link, Route, Switch, Redirect } from 'react-router-dom'; // eslint-disable-line no-unused-vars

import Auth from './models/auth';

import Login from './routes/Login';
import Explorer from './routes/Explorer';
import File from './routes/File';

import './style/App.css';

type State = {
    authorized: boolean,
    data: Record<string, unknown>
}

class App extends React.Component {
    constructor(props: Record<string, unknown>) {
        super(props);

        this.handleLogin = this.handleLogin.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    }

    state: State = {
        authorized: Auth.authorized(),
        data: {}
    }

    handleLogin() : void {
        this.setState({
            authorized: Auth.authorized(),
            data: Auth.data
        });
    }

    handleLogout() : void {
        Auth.setToken('');
        Auth.data = {};

        this.setState({
            authorized: false,
            data: {}
        });
    }

    render() : JSX.Element {
        return (
            <Router>
                <div className='App'>
                    {
                        this.state.authorized
                            ? <Switch>
                                <Route path='/explorer' render={() => <Explorer />} />
                                <Route path='/file' render={() => <File />} />
                                <Redirect exact strict from='/' to='/explorer' />
                            </Switch>
                            : <Switch>
                                <Route path='/' render={() => <Login onLogin={this.handleLogin} />} />
                                <Redirect strict from='/explorer' to='/' />
                                <Redirect strict from='/file' to='/' />
                            </Switch>
                    }
                </div>
            </Router>
        );
    }
}

export default App;
