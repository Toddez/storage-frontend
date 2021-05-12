import React, { RefObject } from 'react';

import Storage from '../models/storage';

type State = {
    src: string,
    width: string,
    height: string,
    className: string,
    visible: boolean,
    observer: IntersectionObserver
}

class StorageVideo extends React.Component<StorageVideoProps> {
    constructor(props: StorageVideoProps) {
        super(props);
    }

    state: State = {
        src: '',
        width: 'auto',
        height: 'auto',
        className: 'loading',
        visible: false,
        observer: new IntersectionObserver(
            ([entry]) => {
                this.setState({ ...this.state, visible: entry.isIntersecting });
                this.onObserve();
            }
        )
    }

    ref: RefObject<HTMLVideoElement> = React.createRef();

    componentDidMount() : void {
        if (!this.ref.current)
            return;

        this.state.observer.observe(this.ref.current);
        this.onObserve();
    }

    async onObserve() : Promise<void> {
        if (!this.state.src && this.state.visible) {
            const src = this.props.src.split('=');
            const res = await Storage.read(src[0], true);

            const state = {
                ...this.state,
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
            this.onObserve();
        }

        if (this.state.visible) {
            await this.ref.current?.play();

            if (this.ref.current && this.state.src) {
                let className = 'loading';
                if (this.ref.current)
                    if (this.ref.current.videoWidth > this.ref.current.videoHeight)
                        className = 'wide';
                    else
                        className = 'tall';

                this.setState({ ...this.state, className: className });
            }
        } else {
            await this.ref.current?.pause();
        }
    }

    componentWillUnmount() : void {
        this.state.observer.disconnect();
    }

    render() : JSX.Element {
        return (
            <video ref={this.ref} controls loop muted src={this.state.src} preload={"metadata"} className={this.state.className} ></video>
        );
    }
}

export default StorageVideo;
