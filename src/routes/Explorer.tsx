import React from 'react';

import Auth from '../models/auth';
import { api_url } from '../models/config';
import { pickIcon } from '../models/icon';

import Preview from '../components/Preview';
import CreateModal from '../components/CreateModal';
import UploadModal from '../components/UploadModal';

import NewFileIcon from 'mdi-material-ui/FilePlusOutline';
import NewFolderIcon from 'mdi-material-ui/FolderPlusOutline';
import UploadIcon from 'mdi-material-ui/FileUploadOutline';
import EditIcon from '@material-ui/icons/EditRounded';
import DeleteIcon from '@material-ui/icons/DeleteOutlined';


import '../style/Explorer.css';

type State = {
    loaded: boolean
    tree: TreeNode,
    types: Record<string, number>,
    position: Array<string>,
    displayCreate: boolean,
    displayUpload: boolean,
    createType: number
}

class Explorer extends React.Component {
    constructor(props: Record<string, unknown>) {
        super(props);

        this.generateNode = this.generateNode.bind(this);
        this.handlePathClick = this.handlePathClick.bind(this);
        this.handleTreeClick = this.handleTreeClick.bind(this);
        this.displayCreateFileModal = this.displayCreateFileModal.bind(this);
        this.displayCreateFolderModal = this.displayCreateFolderModal.bind(this);
        this.displayUploadModal = this.displayUploadModal.bind(this);
        this.create = this.create.bind(this);
        this.upload = this.upload.bind(this);
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
        position: [],
        displayCreate: false,
        displayUpload: false,
        createType: 0
    }

    displayCreateFileModal() : void {
        this.setState({displayCreate: true, createType: this.state.types.FILE});
    }

    displayCreateFolderModal() : void {
        this.setState({displayCreate: true, createType: this.state.types.DIR});
    }

    displayUploadModal() : void {
        this.setState({displayUpload: true});
    }

    componentDidMount() : void {
        this._isMounted = true;

        this.fetchTree();
    }

    fetchTree() : void {
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

    create(data: Record<string, string>) : void {
        fetch(`${api_url}/storage/write/${data.path}`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'x-access-token': Auth.getToken()
            },
            body: JSON.stringify({
                type: this.state.createType,
                data: 'hello world'
            })
        })
            .then((res) => res.json())
            .then(() => {
                this.fetchTree();
            });
    }

    upload(data: Record<string, unknown>) : void {
        console.log('UPLOAD!', data, this.currentNode());
    }

    generateCreateModal() : JSX.Element | null {
        if (!this.state.displayCreate)
            return null;

        return (
            <CreateModal
                data={{ type: this.state.createType, types: this.state.types }}
                cwd={this.currentNode()}
                hide={() => this.setState({displayCreate: false})}
                submit={(data) => this.create(data as Record<string, string>)}
            />
        );
    }

    generateUploadModal() : JSX.Element | null {
        if (!this.state.displayUpload)
            return null;

        return (
            <UploadModal hide={() => this.setState({displayUpload: false})} submit={(data) => this.upload(data)} />
        );
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
                <div className='actions'>
                    <a className='file-edit'>
                        <EditIcon />
                    </a>
                    <a className='file-delete'>
                        <DeleteIcon />
                    </a>
                </div>
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
                {
                    this.generateCreateModal()
                }
                {
                    this.generateUploadModal()
                }
                <div className='tree'>
                    <div className='navigation'>
                        {
                            this.generatePath()
                        }
                        {
                            this.currentNode().type & this.state.types.DIR ?
                                <div className='navigation-actions'>
                                    <div className='add-folder' onClick={() => this.displayCreateFolderModal()}><a><NewFolderIcon /></a></div>
                                    <div className='add-file' onClick={() => this.displayCreateFileModal()}><a><NewFileIcon /></a></div>
                                    <div className='upload-file' onClick={() => this.displayUploadModal()}><a><UploadIcon /></a></div>
                                </div>
                                : null
                        }
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
