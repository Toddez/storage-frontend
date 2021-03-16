import React from 'react';

import Storage from '../models/storage';

function openBase64InNewTab (data: string, mimeType: string) {
    const byteCharacters = atob(data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const file = new Blob([byteArray], { type: mimeType + ';base64' });
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL);
}

type State = {
    src: string,
    data: string,
    width: string,
    height: string
}

class StorageImage extends React.Component<StorageImageProps> {
    constructor(props: StorageImageProps) {
        super(props);
    }

    state: State = {
        src: '',
        data: '',
        width: '100%',
        height: '100%'
    }

    // eslint-disable-next-line
    async componentDidMount() : Promise<any> {
        const src = this.props.src.split('=');
        const res = await Storage.read(src[0], true);
        const state = {
            src: `data:image/*;base64,${res.data}`,
            data: res.data,
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
            <img src={this.state.src} alt={this.props.alt} style={{maxWidth: this.state.width, maxHeight: this.state.height}} onContextMenu={(event) => event.preventDefault()} onClick={ () => {
                openBase64InNewTab(this.state.data, 'image/png');
            }} />
        );
    }
}

export default StorageImage;
