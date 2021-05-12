import React, { RefObject } from 'react';

import Storage from '../models/storage';

type State = {
    src: string,
    width: string,
    height: string,
    observer: IntersectionObserver
}

class StorageVideo extends React.Component<StorageVideoProps> {
    constructor(props: StorageVideoProps) {
        super(props);
    }

    state: State = {
        src: '',
        width: '100%',
        height: '100%',
        observer: new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting)
                    this.onSeen();
            }
        )
    }

    ref: RefObject<HTMLVideoElement> = React.createRef();

    componentDidMount() : void {
        if (!this.ref.current)
            return;

        this.state.observer.observe(this.ref.current);
    }

    async onSeen() : Promise<void> {
        if (this.state.src)
            return;

        const src = this.props.src.split('=');
        const res = await Storage.read(src[0], true);
        const state = {
            src: `data:video/${res.extension};base64,${res.data}`,
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
            <video ref={this.ref} controls loop src={this.state.src}></video>
        );
    }
}

export default StorageVideo;
