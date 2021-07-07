import React, { ChangeEvent, LegacyRef, RefObject } from 'react';

import { theme } from '../models/config';
import Storage from '../models/storage';

import StorageImage from './StorageImage';
import StorageVideo from './StorageVideo';
import StorageLink from './StorageLink';

import { CodeBlock } from 'react-code-blocks';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import dark from 'react-syntax-highlighter/dist/esm/styles/prism/vs-dark';

import EditIcon from '@material-ui/icons/EditRounded';
import DeleteIcon from '@material-ui/icons/DeleteOutlined';
import SaveIcon from 'mdi-material-ui/ContentSaveOutline';
import CancelIcon from 'mdi-material-ui/Cancel';
import RunIcon from 'mdi-material-ui/PlayOutline';

type State = {
    file: TreeNode | null,
    data: FileNode,
    previewOrder: Array<number>,
    run: {
        res: string,
        err: string,
        file: TreeNode | null
    }
}

class Preview extends React.Component<PreviewProps> {
    constructor(props: PreviewProps) {
        super(props);

        this.fetchFile();
        this.onEditor = this.onEditor.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.run = this.run.bind(this);

        this.scrollRef = React.createRef();
        this.targetRef = React.createRef();
        this.dummyRef = React.createRef();
        this.dummyHighlightRef = React.createRef();

        this.loadObserver = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting)
                    this.onLoad();
            },
            {
                rootMargin: '100%'
            }
        );

        this.viewLength = 1;
        this.maxLength = 1;

        Storage.initialize();
        Storage.addReadListener(this.onStorageRead.bind(this));
    }

    _isMounted = false;

    scrollRef: RefObject<StorageImage | StorageVideo>;
    targetRef: RefObject<HTMLDivElement>;
    dummyRef: RefObject<HTMLTextAreaElement>;
    dummyHighlightRef: RefObject<HTMLTextAreaElement>;
    loadObserver: IntersectionObserver;
    viewLength: number;
    maxLength: number;

    state: State = {
        file: null,
        data: {
            lines: 0,
            size: 0,
            data: '',
            extension: '',
            type: 0,
            file: '',
            initial: '',
            path: ''
        },
        previewOrder: new Array<number>(),
        run: {
            res: '',
            err: '',
            file: null
        }
    }

    onStorageRead(file: FileNode) : void {
        if (!this._isMounted)
            return;

        this.setState({data: file});
    }

    file() : TreeNode {
        if (this.props.cwd.type & this.props.types.FILE)
            return this.props.cwd;

        if (this.props.cwd.type & this.props.types.DIR)
            for (const child of this.props.cwd.children) {
                if (child.type & this.props.types.FILE && child.file === 'README.md') {
                    child.parent = this.props.cwd;
                    return child;
                }
            }

        return this.props.cwd;
    }

    getIndex(node: TreeNode) : number {
        if (!node.parent)
            return 0;

        let index = 0;
        for (const child of node.parent.children) {
            if (child === node)
                return index;

            index++;
        }

        return 0;
    }


    componentDidMount() : void {
        this._isMounted = true;
    }

    componentWillUnmount() : void {
        this._isMounted = false;
    }

    onLoad() : void {
        if (!this.scrollRef.current)
            return;

        if (!this.scrollRef.current.ref.current)
            return;

        this.loadObserver.unobserve(this.scrollRef.current.ref.current);
        if (this.viewLength < this.maxLength) {
            this.viewLength = Math.min(this.viewLength + 5, this.maxLength);
            this.forceUpdate();
        }
    }

    fetchFile() : void {
        const file = this.file();
        if (this.state.file === file)
            return;

        this.setState({file: file});

        if (!(file.type & this.props.types.FILE))
            return;

        const spl = file.path.split('/');
        Storage.read(spl.slice(1, spl.length).join('/'));
    }

    componentDidUpdate() : void {
        this.fetchFile();
        this.onScroll();

        if (!this.scrollRef.current)
            return;

        if (!this.scrollRef.current.ref.current)
            return;

        this.loadObserver.observe(this.scrollRef.current.ref.current);
    }

    generateFileInfo(name: string, lines: number, size: number) : JSX.Element {
        return (
            <div className='file-info'>
                <a id={`file-info-actions.${this.getIndex(this.file())}`} className='file-edit' onClick={this.props.handleNodeActionClick}>{name}</a>
                <div className='inline-seperator'></div>
                <div className='file-lines'>{lines} lines</div>
                <div className='inline-seperator'></div>
                <div className='file-size'>{this.formatBytes(size)}</div>
            </div>
        );
    }

    isEditable(node: TreeNode | FileNode) : boolean {
        return !(node.type & this.props.types.IMAGE
            || node.type & this.props.types.VIDEO);
    }

    // eslint-disable-next-line
    markdownRenderers() : Record<string, ((data: any) => JSX.Element)> {
        return {
            code: ({language, value} : CodeRendererProps) => {
                return (
                    <SyntaxHighlighter style={dark} language={language} children={value} />
                );
            },
            image: ({src} : ImageRendererProps) => {
                return (
                    <StorageImage src={src} />
                );
            },
            link: ({href, children} : LinkRendererProps) => {
                let isLocal = true;
                let isValid = true;

                let cwd = this.props.cwd.path.split('/');
                if (cwd[0] === 'root')
                    cwd = cwd.slice(1, cwd.length);

                const node = Storage.cwd(cwd + (cwd.length === 0 ? '' : '/') + href);

                const path = node.path.split('/');
                const finalPath = path.slice(1, path.length).join('/');

                if (!finalPath.endsWith(href))
                    if (href.startsWith('http://') || href.startsWith('https://'))
                        isLocal = false;
                    else
                        isValid = false;

                return (
                    <StorageLink local={isLocal} valid={isValid} href={href} children={children} callback={this.props.linkCallback} />
                );
            }
        };
    }


    generateFilePreview() : JSX.Element | null {
        const file = this.state.data;
        const cwd = this.state.file as TreeNode;

        if (cwd.type & this.props.types.CRAWLABLE) {
            const nodes = cwd.children.map((node) => {
                if (node.type & this.props.types.IMAGE || node.type & this.props.types.VIDEO) {
                    return node;
                }
            }).filter(node => node !== undefined);
            const randValues = this.state.previewOrder;
            while (randValues.length < nodes.length)
                randValues.push(Math.random());

            nodes.sort((a, b) => {
                return randValues[nodes.indexOf(a)] > randValues[nodes.indexOf(b)] ? 1 : -1;
            });

            this.maxLength = nodes.length;

            const imageElements = nodes.slice(0, this.viewLength).map((node, index) => {
                if (!node)
                    return;

                if (node.type & this.props.types.IMAGE) {
                    const path = node.path.split('/');
                    return (
                        <StorageImage key={index} src={path.slice(1, path.length).join('/')} ref={index === Math.min(nodes.length, this.viewLength) - 1 ? this.scrollRef as LegacyRef<StorageImage>: undefined} />
                    );
                }

                if (node.type & this.props.types.VIDEO) {
                    const path = node.path.split('/');
                    return (
                        <StorageVideo key={index} src={path.slice(1, path.length).join('/')} ref={index === Math.min(nodes.length, this.viewLength) - 1 ? this.scrollRef as LegacyRef<StorageVideo>: undefined} />
                    );
                }
            }).filter(node => node !== undefined);

            if (imageElements.length > 0) {
                return (
                    <ul className='images'>
                        {imageElements}
                    </ul>
                );
            }
        }

        if (!file)
            return null;

        if (!(cwd.type & this.props.types.FILE))
            return null;

        if (file.extension === 'md')
            return (
                <ReactMarkdown className='markdown-preview' renderers={this.markdownRenderers()} children={this.state.data.data} />
            );

        if (this.isEditable(file))
            return (
                <CodeBlock
                    text={this.state.data.data + (this.state.data.data[this.state.data.data.length - 1] === '\n' ? ' ' : '')}
                    language={this.state.data.type & this.props.types.RAW ? this.state.data.extension : 'text'}
                    showLineNumbers={true}
                    theme={theme}
                    wrapLines={true}
                />
            );

        if (file.type & this.props.types.IMAGE)
            return (
                <StorageImage src={file.path} />
            );

        if (file.type & this.props.types.VIDEO) {
            return (
                <StorageVideo src={file.path} />
            );
        }

        return null;
    }

    onEditor(event: ChangeEvent<HTMLTextAreaElement>) : void {
        this.setState({data: {...this.state.data, data: event.target.value}});
    }

    generateCodeEditor() : JSX.Element {
        return (
            <div className='editor' ref={this.targetRef}>
                <CodeBlock
                    text={this.state.data.data + '\n '}
                    language={this.state.data.type & this.props.types.RAW ? this.state.data.extension : 'text'}
                    showLineNumbers={true}
                    theme={theme}
                />
                <textarea ref={this.dummyHighlightRef} className='editor-extra-style' name="data" id="data" value={this.data(this.state.data.data)} readOnly={true}></textarea>
                <textarea ref={this.dummyRef} name="data" id="data" value={this.state.data.data} onChange={this.onEditor} onScroll={this.onScroll} spellCheck={false} autoFocus></textarea>
            </div>
        );
    }

    formatBytes(bytes: number, decimals = 2) : string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    data(data: string) : string {
        data = data.replaceAll(/[.↓]/gm, 'a');
        data = data.replaceAll(/[^\s]/gm, 'a');
        data = data.replaceAll(/[\n]/gm, '↓');
        data = data.replaceAll(/[\s]/gm, '.');
        data = data.replaceAll(/[↓]/gm, '↓\n');
        data = data.replaceAll(/[a]/gm, ' ');

        return data;
    }

    onScroll() : void {
        if (!this._isMounted)
            return;

        if (this.targetRef.current) {
            if (this.dummyRef.current) {
                (this.targetRef.current.childNodes[0].childNodes[1] as HTMLElement).scrollLeft = this.dummyRef.current.scrollLeft;
                this.dummyRef.current.style.height = (this.targetRef.current.childNodes[0].childNodes[1] as HTMLElement).offsetHeight + 'px';
                this.dummyRef.current.style.width = (this.targetRef.current.childNodes[0].childNodes[1] as HTMLElement).offsetWidth + 'px';
            }

            if (this.dummyHighlightRef.current) {
                this.dummyHighlightRef.current.scrollLeft = (this.targetRef.current.childNodes[0].childNodes[1] as HTMLElement).scrollLeft;
                this.dummyHighlightRef.current.style.height = (this.targetRef.current.childNodes[0].childNodes[1] as HTMLElement).offsetHeight + 'px';
                this.dummyHighlightRef.current.style.width = (this.targetRef.current.childNodes[0].childNodes[1] as HTMLElement).offsetWidth + 'px';
            }
        }
    }

    run() : void {
        if (!this._isMounted)
            return;

        let script = `
            (function () {
            'use strict';
            const log = function (value) { return value; };
        `;
        script += this.state.data.data;
        script += `})();`;

        let res, err;
        try {
            res = eval(script);
        } catch (thrownError) {
            err = thrownError.stack;
        }

        this.setState({run: {res: res, err: err, file: this.file()}});
    }

    render() : JSX.Element {
        if (!this.state.file)
            return (
                <div className='file'></div>
            );

        return (
            <div className='file'>
                { (this.state.file.type & this.props.types.FILE) ?
                    <div className='header'>
                        {
                            this.props.isEditing ?
                                this.generateFileInfo(this.state.data.file, this.state.data.data.split('\n').length, (new TextEncoder().encode(this.state.data.data)).length)
                                :this.generateFileInfo(this.state.data.file, this.state.data.lines, this.state.data.size)
                        }
                        <div id={`file-preview-actions.${this.getIndex(this.file())}`} className='file-actions' onClick={this.props.handleNodeActionClick}>
                            {this.props.isEditing === false && this.file().extension === 'js' ? <a className='file-run' onClick={() => this.run() } ><RunIcon /></a> : null}
                            {this.isEditable(this.file()) ? (
                                this.props.isEditing ?
                                    <a className='file-save' onClick={() => this.props.onEdit(this.file(), this.state.data.data)}><SaveIcon /></a>
                                    :<a className='file-edit'><EditIcon /></a>
                            ) : null }
                            {this.props.isEditing ? <a className='file-save file-cancel' onClick={() => this.props.onEdit(this.file(), this.state.data.initial)}><CancelIcon /></a> : null}
                            <a className='file-delete'><DeleteIcon /></a>
                        </div>
                    </div>
                    : null
                }
                <div className='file-preview'>
                    {this.props.isEditing === false && this.file().extension === 'js' ? (this.state.run.file === this.file() ? <div className='run-output'>Output:<div className='run-result'>{this.state.run.res}</div><div className='run-error'>{this.state.run.err}</div></div> : null) : null}
                    {this.props.isEditing ? this.generateCodeEditor() : this.generateFilePreview()}
                </div>
            </div>
        );
    }
}

export default Preview;
