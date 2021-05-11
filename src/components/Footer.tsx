import React from 'react';

import { ReactComponent as Icon } from '../resources/images/icon.svg';
import '../style/Footer.css';

class Footer extends React.Component {
    render() : JSX.Element {
        return (
            <footer className='Footer'>
                <a className='icon' href="/">
                    <Icon />
                </a>
                <div className='links'>
                    <div className='item copyright'>&copy; {(new Date()).getFullYear()} <a href="https://github.com/Toddez">Teo Carlsson</a></div>
                </div>
            </footer>
        );
    }
}

export default Footer;
