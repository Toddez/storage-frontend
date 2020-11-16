import React, { ChangeEvent, RefObject } from 'react';

import { api_url, theme } from '../models/config';
import Auth from '../models/auth';

import { CodeBlock } from 'react-code-blocks';
import ReactMarkdown from 'react-markdown';

import EditIcon from '@material-ui/icons/EditRounded';
import DeleteIcon from '@material-ui/icons/DeleteOutlined';
import SaveIcon from 'mdi-material-ui/ContentSaveOutline';
import CancelIcon from 'mdi-material-ui/Cancel';

type File = {
    extension: string,
    data: string,
    type: number
    lines: number,
    size: number,
    file: string,
    initial: string
}

type State = {
    file: TreeNode | null,
    data: File
}

class Preview extends React.Component<PreviewProps> {
    constructor(props: PreviewProps) {
        super(props);

        this.fetchFile();
        this.onEditor = this.onEditor.bind(this);
        this.onScroll = this.onScroll.bind(this);

        this.targetRef = React.createRef();
        this.dummyRef = React.createRef();
    }

    _isMounted = false;

    targetRef: RefObject<HTMLTextAreaElement>;
    dummyRef: RefObject<HTMLTextAreaElement>;

    state: State = {
        file: null,
        data: {
            lines: 0,
            size: 0,
            data: '',
            extension: '',
            type: 0,
            file: '',
            initial: ''
        }
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

    fetchFile() : void {
        const file = this.file();
        if (this.state.file === file)
            return;

        this.setState({file: file});

        if (!(file.type & this.props.types.FILE))
            return;

        const spl = file.path.split('/');
        fetch(`${api_url}/storage/read/${spl.slice(1, spl.length).join('/')}`, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json',
                'x-access-token': Auth.getToken()
            }
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.errors)
                    return;

                if (!this._isMounted)
                    return;

                res.initial = res.data;

                this.setState({data: res});
            });
    }

    componentDidUpdate() : void {
        this.fetchFile();
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

    generateCodeBlock() : JSX.Element {
        return (
            <CodeBlock
                text={this.state.data.data}
                language={this.state.data.type & this.props.types.RAW ? this.state.data.extension : 'text'}
                showLineNumbers={true}
                theme={theme}
                wrapLines={true}
            />
        );
    }

    onEditor(event: ChangeEvent<HTMLTextAreaElement>) : void {
        this.setState({data: {...this.state.data, data: event.target.value}});
    }

    generateCodeEditor() : JSX.Element {
        return (
            <div className='editor'>
                <textarea ref={this.targetRef} name="data" id="data" value={this.state.data.data} onChange={this.onEditor} onScroll={this.onScroll} spellCheck={false} autoFocus></textarea>
                <textarea ref={this.dummyRef} className='editor-extra-style' name="data" id="data" value={this.data(this.state.data.data)} readOnly={true}></textarea>
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
        if (this.targetRef.current) {
            if (this.dummyRef.current) {
                this.dummyRef.current.scrollTop = this.targetRef.current.scrollTop;
            }
        }
    }

    render() : JSX.Element {
        if (!this.state.file)
            return (
                <div className='file'></div>
            );

        if (!(this.state.file.type & this.props.types.FILE))
            return (
                <div className='file'></div>
            );

        return (
            <div className='file'>
                <div className='header'>
                    {
                        this.props.isEditing ?
                            this.generateFileInfo(this.state.data.file, this.state.data.data.split('\n').length, (new TextEncoder().encode(this.state.data.data)).length)
                            :this.generateFileInfo(this.state.data.file, this.state.data.lines, this.state.data.size)
                    }
                    <div id={`file-preview-actions.${this.getIndex(this.file())}`} className='file-actions' onClick={this.props.handleNodeActionClick}>
                        {
                            this.props.isEditing ?
                                <a className='file-save' onClick={() => this.props.onEdit(this.file(), this.state.data.data)}><SaveIcon /></a>
                                :<a className='file-edit'><EditIcon /></a>
                        }
                        {this.props.isEditing ? <a className='file-save file-cancel' onClick={() => this.props.onEdit(this.file(), this.state.data.initial)}><CancelIcon /></a> : null}
                        <a className='file-delete'><DeleteIcon /></a>
                    </div>
                </div>
                <div className='file-preview'>
                    {this.props.isEditing ? this.generateCodeEditor() : ( this.file().file === 'README.md' ? <ReactMarkdown className='markdown-preview' children={this.state.data.data} /> : this.generateCodeBlock())}
                </div>
            </div>
        );
    }
}

export default Preview;
