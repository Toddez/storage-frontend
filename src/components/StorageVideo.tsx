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
        this.onLoad();
        this.onPlay();
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
            this.onPlay();
        }

        if (!this.state.src)
            return;

        if (!this.ref.current)
            return;

        if (this.state.shouldLoad) {
            await this.ref.current.play();

            const width = this.ref.current.videoWidth;
            const height = this.ref.current.videoHeight;
            const className = width > height ? 'wide' : 'tall';

            if (!this.state.shouldPlay)
                await this.ref.current.pause();

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

    render() : JSX.Element {
        return (
            <span className='image-container' style={{maxWidth: `${this.ref.current?.offsetWidth}px`, maxHeight: `${this.ref.current?.offsetHeight}px`}}>
                <video ref={this.ref} controls loop muted src={this.state.src} preload={"metadata"} style={this.state.width && this.state.height ? {maxWidth: this.state.width, maxHeight: this.state.height} : {}}  className={`${this.state.className}${this.state.shouldPlay ? ' playing' : ' paused'}`} ></video>
                <span className='video-paused' ></span>
                <span className='overlay-text' >{this.props.src.split('/').pop()}</span>
            </span>
        );
    }
}

export default StorageVideo;
