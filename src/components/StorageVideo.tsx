import React, { RefObject } from 'react';

import Storage from '../models/storage';

type State = {
    src: string,
    width: string,
    height: string,
    className: string,
    shouldLoad: boolean,
    shouldPlay: boolean,
    loadObserver: IntersectionObserver,
    playObserver: IntersectionObserver
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
        shouldLoad: false,
        shouldPlay: false,
        loadObserver: new IntersectionObserver(
            ([entry]) => {
                this.setState({ ...this.state, shouldLoad: entry.isIntersecting });
                this.onLoad();
            },
            {
                rootMargin: '100%'
            }
        ),
        playObserver: new IntersectionObserver(
            ([entry]) => {
                this.setState({ ...this.state, shouldPlay: entry.isIntersecting });
                this.onPlay();
            },
            {
                threshold: 0.5
            }
        )
    }

    ref: RefObject<HTMLVideoElement> = React.createRef();

    componentDidMount() : void {
        if (!this.ref.current)
            return;

        this.state.loadObserver.observe(this.ref.current);
        this.state.playObserver.observe(this.ref.current);
    }

    async onLoad() : Promise<void> {
        if (!this.state.src && this.state.shouldLoad) {
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
            this.onLoad();
        }

        if (!this.state.src)
            return;

        if (!this.ref.current)
            return;

        if (this.state.shouldLoad) {
            let className = 'loading';
            if (this.ref.current.videoWidth > this.ref.current.videoHeight)
                className = 'wide';
            else
                className = 'tall';

            this.setState({ ...this.state, className: className });
        }
    }

    async onPlay() : Promise<void> {
        if (!this.state.src)
            return;

        if (!this.ref.current)
            return;

        if (this.state.shouldPlay)
            await this.ref.current?.play();
        else
            await this.ref.current?.pause();
    }

    componentWillUnmount() : void {
        if (!this.ref.current)
            return;

        this.state.loadObserver.unobserve(this.ref.current);
        this.state.playObserver.unobserve(this.ref.current);
    }

    render() : JSX.Element | null {
        return (
            <video ref={this.ref} controls loop muted src={this.state.src} preload={"metadata"} className={this.state.className} ></video>
        );
    }
}

export default StorageVideo;
