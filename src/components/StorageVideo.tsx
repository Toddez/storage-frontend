import React, { RefObject } from 'react';

import Storage from '../models/storage';

type State = {
    src: string,
    width: string,
    height: string,
    observer: IntersectionObserver,
    visible: boolean
}

class StorageVideo extends React.Component<StorageVideoProps> {
    constructor(props: StorageVideoProps) {
        super(props);
    }

    state: State = {
        src: '',
        width: 'auto',
        height: 'auto',
        observer: new IntersectionObserver(
            ([entry]) => {
                this.setState({ ...this.state, visible: entry.isIntersecting });
                this.onObserve();
            }
        ),
        visible: false
    }

    ref: RefObject<HTMLVideoElement> = React.createRef();

    componentDidMount() : void {
        if (!this.ref.current)
            return;

        this.state.observer.observe(this.ref.current);
    }

    async onObserve() : Promise<void> {
        if (!this.state.src && this.state.visible) {
            const src = this.props.src.split('=');
            const res = await Storage.read(src[0], true);
            const state = {
                src: `data:video/${res.extension};base64,${res.data}`,
                width: this.state.width,
                height: this.state.height
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

        if (this.state.visible) {
            this.ref.current?.play();
        }else {
            this.ref.current?.pause();
        }
    }

    render() : JSX.Element {
        return (
            <video ref={this.ref} controls loop muted src={this.state.src} preload={"metadata"}></video>
        );
    }
}

export default StorageVideo;
