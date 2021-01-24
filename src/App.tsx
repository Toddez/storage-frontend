import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'; // eslint-disable-line no-unused-vars

import Auth from './models/auth';
import { apiUrl } from './models/config';

import Login from './routes/Login';
import Explorer from './routes/Explorer';

import Footer from './components/Footer';

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
        fetch(`${apiUrl}/logout`, {
            method: 'POST',
            credentials: 'include'
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.errors)
                    return;

                Auth.setToken('');
                Auth.data = {};
                this.setState({
                    authorized: false,
                    data: {}
                });
            });
    }

    render() : JSX.Element {
        return (
            <Router>
                <div className='App'>
                    <div className='Route'>
                        {
                            this.state.authorized
                                ? <Switch>
                                    <Route path='/explorer' render={() => <Explorer onLogout={this.handleLogout} />} />
                                    <Redirect exact strict from='/' to='/explorer' />
                                </Switch>
                                : <Switch>
                                    <Route path='/' render={() => <Login onLogin={this.handleLogin} onLogout={this.handleLogout} />} />
                                    <Redirect strict from='/explorer' to='/' />
                                </Switch>
                        }
                    </div>
                    <Footer />
                </div>
            </Router>
        );
    }
}

export default App;
