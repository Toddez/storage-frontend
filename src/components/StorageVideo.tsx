import React from 'react';

import Storage from '../models/storage';

const blob = (data: string, mimeType: string) : Blob => {
    const byteCharacters = atob(data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType + ';base64' });
};

const openBase64InNewTab = (data: string, mimeType: string) : void => {
    const file = blob(data, mimeType);
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL);
};

type State = {
    src: string,
    extension: string,
    data: string,
    width: string,
    height: string
}

class StorageVideo extends React.Component<StorageVideoProps> {
    constructor(props: StorageVideoProps) {
        super(props);
    }

    state: State = {
        src: '',
        data: '',
        extension: '',
        width: '100%',
        height: '100%'
    }

    // eslint-disable-next-line
    async componentDidMount() : Promise<any> {
        const src = this.props.src.split('=');
        const res = await Storage.read(src[0], true);
        const state = {
            src: `data:video/*;base64,${res.data}`,
            extension: res.extension,
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

        console.log(state);
        this.setState(state);
    }

    render() : JSX.Element {
        return (
            <video controls loop onClick={() => {
                openBase64InNewTab(this.state.data, `video/${this.state.extension}`);
            }} src={`data:video/${this.state.extension};base64,${this.state.data}`} >
            </video>
        );
    }
}

export default StorageVideo;
