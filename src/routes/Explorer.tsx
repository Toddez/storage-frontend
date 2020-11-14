import React from 'react';

import Auth from '../models/auth';
import { api_url, theme } from '../models/config';

import { pickIcon } from '../models/icon';

import EditIcon from '@material-ui/icons/EditRounded';
import DeleteIcon from '@material-ui/icons/DeleteOutlined';
import NewIcon from 'mdi-material-ui/FilePlusOutline';
import UploadIcon from 'mdi-material-ui/FileUploadOutline';

import { CodeBlock } from 'react-code-blocks';

import '../style/Explorer.css';

type Node = {
    children: Array<Node>,
    type: number,
    path: string,
    file: string,
    extension: string
}

type State = {
    loaded: boolean
    tree: Node,
    types: Record<string, number>,
    position: Array<string>
}

class Explorer extends React.Component {
    constructor(props: Record<string, unknown>) {
        super(props);

        this.generateNode = this.generateNode.bind(this);
        this.handlePathClick = this.handlePathClick.bind(this);
        this.handleTreeClick = this.handleTreeClick.bind(this);
    }

    _isMounted = false;

    state: State = {
        loaded: false,
        tree: {
            children: [],
            type: 0,
            path: '',
            file: '',
            extension: ''
        },
        types: {},
        position: []
    }

    componentDidMount() : void {
        this._isMounted = true;

        fetch(`${api_url}/storage/`, {
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

                this.setState({loaded: true, tree: res.tree, types: res.types});
            });
    }

    componentWillUnmount() : void {
        this._isMounted = false;
    }

    find(node: Node, name: string) : Node {
        for (const child of node.children) {
            let check = '';
            if (child.type & this.state.types.DIR)
                check = child.path.split('/').slice(-1)[0];
            else if(child.type & this.state.types.FILE)
                check = child.file;

            if (check === name)
                return child;
        }

        return node;
    }

    generatePath() : JSX.Element {
        let node = this.state.tree;

        const elements = (
            <div className='path'>
                <div className='item' key={0}>
                    <a onClick={this.handlePathClick}>~</a>/
                </div>
                {this.state.position.map((value, index) => {
                    const next = this.find(node, value);

                    if (next === node)
                        return null;

                    node = next;
                    const isDir = node.type & this.state.types.DIR || index + 1 < this.state.position.length;

                    return (
                        <div className='item' key={index}>
                            <a onClick={this.handlePathClick}>{value}</a>{isDir ? '/' : ''}
                        </div>
                    );
                })}
            </div>
        );

        return elements;
    }

    generateNode(node: Node, index: number) : JSX.Element {
        const Icon = pickIcon(node, this.state.types);
        const isDir = node.type & this.state.types.DIR;

        return (
            <div className='node' key={index}>
                <div className='icon'>
                    <Icon />
                </div>
                <a className='name' onClick={this.handleTreeClick}>
                    {isDir ? node.path.split('/').slice(-1)[0] : node.file}
                </a>
            </div>
        );
    }

    generateNodes() : JSX.Element {
        let node = this.state.tree;
        for (const pos of this.state.position) {
            const next = this.find(node, pos);
            if (next === node)
                break;

            node = next;
        }

        return (
            <div className='nodes'>
                {node !== this.state.tree ? <a className='node go-up' onClick={this.handleTreeClick}><div className='name'>..</div></a> : null}
                {node.children.map(this.generateNode)}
            </div>
        );
    }

    navigate(path: string) : void {
        const pos = path.split('/');
        this.setState({position: pos.filter((a) => a !== '')});
    }

    handlePathClick(event: any) : void {
        const target = event.target;
        const value = target.text;

        if (value === '~')
            this.navigate('');

        // TODO: Implement path click
    }

    handleTreeClick(event: any) : void {
        const target = event.target;
        const value = target.text;

        console.log(value);

        console.log(this.state.position.slice(0, this.state.position.length - 1).join('/'));
        if (value === '..')
            return this.navigate(this.state.position.slice(0, this.state.position.length - 1).join('/'));

        this.navigate([...this.state.position, value].join('/'));
    }

    render() : JSX.Element {
        return (
            <div className='Explorer'>
                <div className='tree'>
                    <div className='navigation'>
                        {
                            this.generatePath()
                        }
                        <div className='navigation-actions'>
                            <div className='add-file'><a><NewIcon /></a></div>
                            <div className='upload-file'><a><UploadIcon /></a></div>
                        </div>
                    </div>
                    {
                        this.generateNodes()
                    }
                </div>
                <div className='file'>
                    <div className='header'>
                        <div className='file-info'>
                            <div className='file-lines'>35 lines</div>
                            <div className='inline-seperator'></div>
                            <div className='file-size'>1.65 KB</div>
                        </div>
                        <div className='file-actions'>
                            <a className='file-raw'>Raw</a>
                            <a className='file-edit'><EditIcon /></a>
                            <a className='file-delete'><DeleteIcon /></a>
                        </div>
                    </div>
                    <div className='editor'>
                        <CodeBlock
                            text={'// a  variable\nconst a = 123;\n// a function\nconst sum = (x, y) => x + y;'}
                            language='tsx'
                            showLineNumbers={true}
                            theme={theme}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default Explorer;
