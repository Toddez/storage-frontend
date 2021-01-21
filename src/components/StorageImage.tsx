import React from 'react';

import Storage from '../models/storage';

type State = {
    src: string,
    width: string,
    height: string
}

class StorageImage extends React.Component<StorageImageProps> {
    constructor(props: StorageImageProps) {
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
            src: `data:image/*;base64,${res.data}`,
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
            <img src={this.state.src} alt={this.props.alt} style={{maxWidth: this.state.width, maxHeight: this.state.height}}/>
        );
    }
}

export default StorageImage;
