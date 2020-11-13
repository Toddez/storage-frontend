import React from 'react';

import '../style/Footer.css';

class Footer extends React.Component {
    render() : JSX.Element {
        return (
            <footer className='Footer'>
                <a className='icon' href="/"><img src="/icon.svg" alt=""/></a>
                <div className='links'>
                    <div className='item copyright'>&copy; 2020 Teo Carlsson</div>
                    <div className='item'><a href="/">Privacy</a></div>
                    <div className='item'><a href="/">API</a></div>
                    <div className='item'><a href="/">About</a></div>
                    <div className='item'><a href="/">Status</a></div>
                </div>
            </footer>
        );
    }
}

export default Footer;
