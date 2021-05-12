import React from 'react';

import Storage from '../models/storage';

type State = {
    src: string,
    width: string,
    height: string
}

class StorageVideo extends React.Component<StorageVideoProps> {
    constructor(props: StorageVideoProps) {
        super(props);
    }

    state: State = {
        src: '',
        width: '100%',
        height: '100%'
    }

    // eslint-disable-next-line
    async componentDidMount() : Promise<any> {
        const src = this.props.src.split('=');
        const res = await Storage.read(src[0], true);
        const state = {
            src: `data:video/${res.extension};base64,${res.data}`,
            extension: res.extension,
            width: '100%',
            height: '100%'
        };

        if (src.length > 1) {
            const dimensions = src[1].split('x');
            if (dimensions.length > 1) {
                state.width = `${dimensions[0]}px`;
                state.height = `${dimensions[1]}px`;
            }
        }

        this.setState(state);
    }

    render() : JSX.Element {
        return (
            <video controls loop src={this.state.src} >
            </video>
        );
    }
}

export default StorageVideo;
