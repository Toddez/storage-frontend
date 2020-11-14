import React from 'react';

import { api_url, theme } from '../models/config';
import Auth from '../models/auth';

import { CodeBlock } from 'react-code-blocks';

import EditIcon from '@material-ui/icons/EditRounded';
import DeleteIcon from '@material-ui/icons/DeleteOutlined';

type File = {
    extension: string,
    data: string,
    type: number
    lines: number,
    size: number,
    file: string
}

type State = {
    file: TreeNode | null,
    data: File
}

class Preview extends React.Component<PreviewProps> {
    constructor(props: PreviewProps) {
        super(props);

        this.fetchFile();
    }

    _isMounted = false

    state: State = {
        file: null,
        data: {
            lines: 0,
            size: 0,
            data: '',
            extension: '',
            type: 0,
            file: ''
        }
    }

    file() : TreeNode {
        if (this.props.cwd.type & this.props.types.FILE)
            return this.props.cwd;

        if (this.props.cwd.type & this.props.types.DIR)
            for (const child of this.props.cwd.children) {
                if (child.type & this.props.types.FILE && child.file === 'README.md') {
                    return child;
                }
            }

        return this.props.cwd;
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

                this.setState({data: res});
            });
    }

    componentDidUpdate() : void {
        this.fetchFile();
    }

    generateFileInfo() : JSX.Element {
        return (
            <div className='file-info'>
                <div className='file-name'>{this.state.data.file}</div>
                <div className='inline-seperator'></div>
                <div className='file-lines'>{this.state.data.lines}</div>
                <div className='inline-seperator'></div>
                <div className='file-size'>{this.state.data.size} bytes</div>
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
                wrapLines
            />
        );
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
                    {this.generateFileInfo()}
                    <div className='file-actions'>
                        <a className='file-raw'>Raw</a>
                        <a className='file-edit'><EditIcon /></a>
                        <a className='file-delete'><DeleteIcon /></a>
                    </div>
                </div>
                <div className='editor'>
                    {this.generateCodeBlock()}
                </div>
            </div>
        );
    }
}

export default Preview;
