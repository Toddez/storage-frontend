import React from 'react';

import Auth from '../models/auth';
import { api_url, theme } from '../models/config';
import { pickIcon } from '../models/icon';

import Preview from '../components/Preview';
import { CopyBlock } from 'react-code-blocks';

import NewIcon from 'mdi-material-ui/FilePlusOutline';
import UploadIcon from 'mdi-material-ui/FileUploadOutline';

import '../style/Explorer.css';

type State = {
    loaded: boolean
    tree: TreeNode,
    types: Record<string, number>,
    position: Array<string>
}

interface ClickTarget extends EventTarget {
    text: string,
    parentElement: HTMLElement
}

interface ClickEvent extends React.MouseEvent<HTMLAnchorElement, MouseEvent> {
    target: ClickTarget,
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

                if (!this._isMounted)
                    return;

                this.setState({loaded: true, tree: res.tree, types: res.types});
            });
    }

    componentWillUnmount() : void {
        this._isMounted = false;
    }

    find(node: TreeNode, name: string) : TreeNode {
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
                <div id={`item.${0}`} className='item' key={0}>
                    <a onClick={this.handlePathClick}>~</a>/
                </div>
                {this.state.position.map((value, index) => {
                    const next = this.find(node, value);

                    if (next === node)
                        return null;

                    node = next;
                    const isDir = node.type & this.state.types.DIR || index + 1 < this.state.position.length;

                    return (
                        <div id={`item.${index + 1}`} className='item' key={index + 1}>
                            <a onClick={this.handlePathClick}>{value}</a>{isDir ? '/' : ''}
                        </div>
                    );
                })}
            </div>
        );

        return elements;
    }

    generateNode(node: TreeNode, index: number) : JSX.Element {
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

        node.children = node.children.sort((a: TreeNode, b: TreeNode) : number => {
            const dir = this.state.types.DIR;
            const file = this.state.types.FILE;

            if (a.type & dir && b.type & file)
                return -1;

            if (a.type & dir && b.type & file)
                return 1;

            if (a.type & dir && b.type & dir && a.path < b.path)
                return -1;

            if (a.type & dir && b.type & dir && a.path > b.path)
                return 1;

            if (a.type & file && b.type & file && a.file < b.file)
                return -1;

            if (a.type & file && b.type & file && a.file > b.file)
                return 1;

            return 0;
        });

        return (
            <div className='nodes'>
                {node !== this.state.tree ? <a className='node go-up' onClick={this.handleTreeClick}>..</a> : null}
                {node.children.map(this.generateNode)}
            </div>
        );
    }

    currentNode() : TreeNode {
        let current = this.state.tree;
        for (const pos of this.state.position) {
            const next = this.find(current, pos);
            if (next === current)
                return current;
            current = next;
        }

        return current;
    }

    navigate(path: string) : void {
        const pos = path.split('/');
        this.setState({position: pos.filter((a) => a !== '')});
    }

    handlePathClick(event: ClickEvent) : void {
        const target = event.target;
        const value = target.text;
        const id = parseInt(target.parentElement.id.split('.')[1]);

        if (value === '~')
            return this.navigate('');

        this.navigate(this.state.position.slice(0, id).join('/'));
    }

    handleTreeClick(event: ClickEvent) : void {
        const target = event.target;
        const value = target.text;

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
                <Preview cwd={this.currentNode()} types={this.state.types}/>
            </div>
        );
    }
}

export default Explorer;
