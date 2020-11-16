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
import DeleteIcon from '@material-ui/icons/DeleteOutlined';


import '../style/Explorer.css';

type State = {
    loaded: boolean
    tree: TreeNode,
    types: Record<string, number>,
    position: Array<string>,
    displayCreate: boolean,
    displayUpload: boolean,
    createType: number,
    name: string,
    editingName: TreeNode | null
}

class Explorer extends React.Component {
    constructor(props: Record<string, unknown>) {
        super(props);

        this.generateNode = this.generateNode.bind(this);
        this.handlePathClick = this.handlePathClick.bind(this);
        this.handleTreeClick = this.handleTreeClick.bind(this);
        this.handleNodeActionClick = this.handleNodeActionClick.bind(this);
        this.displayCreateFileModal = this.displayCreateFileModal.bind(this);
        this.displayCreateFolderModal = this.displayCreateFolderModal.bind(this);
        this.displayUploadModal = this.displayUploadModal.bind(this);
        this.create = this.create.bind(this);
        this.upload = this.upload.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
        this.onNameDown = this.onNameDown.bind(this);
    }

    _isMounted = false;

    state: State = {
        loaded: false,
        tree: {
            children: [],
            type: 0,
            path: '',
            file: '',
            extension: '',
            parent: null,
        },
        types: {},
        position: [],
        displayCreate: false,
        displayUpload: false,
        createType: 0,
        name: '',
        editingName: null
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
                <div id={`path-item.${0}`} className='item' key={0}>
                    <a onClick={this.handlePathClick}>~</a>/
                </div>
                {this.state.position.map((value, index) => {
                    const next = this.find(node, value);

                    if (next === node)
                        return null;

                    node = next;
                    const isDir = node.type & this.state.types.DIR || index + 1 < this.state.position.length;

                    return (
                        <div id={`path-item.${index + 1}`} className='item' key={index + 1}>
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
                data: '\n'
            })
        })
            .then((res) => res.json())
            .then(() => {
                if (!this._isMounted)
                    return;

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

    treeName (node: TreeNode) : string {
        if (this.state.editingName === node)
            return this.state.name;

        const isDir = node.type & this.state.types.DIR;
        return isDir ? node.path.split('/').slice(-1)[0] : node.file;
    }

    generateNode(node: TreeNode, index: number) : JSX.Element {
        const { Icon, color } = pickIcon(node, this.state.types);

        return (
            <div className='node' key={index}>
                <div className='icon'>
                    <Icon style={{fill: `var(--color-accent${color})`}}/>
                </div>
                <input type='text' className='name' onClick={this.handleTreeClick} value={this.treeName(node)} readOnly={true} onChange={this.onNameChange} onKeyDown={this.onNameDown}></input>
                <div id={`tree-node-actions.${index}`} className='actions' onClick={this.handleNodeActionClick}>
                    <a className='file-rename'>
                        Rename
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
                {node !== this.state.tree ? <input type='text' className='node go-up' onClick={this.handleTreeClick} value='..' readOnly={true}></input> : null}
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

    handlePathClick(event: ClickEvent<HTMLAnchorElement>) : void {
        const target = event.target;
        const value = target.text;
        const id = parseInt(target.parentElement.id.split('.')[1]);

        if (value === '~')
            return this.navigate('');

        this.navigate(this.state.position.slice(0, id).join('/'));
    }

    onNameChange(event: React.ChangeEvent<HTMLInputElement>) : void {
        this.setState({name: event.target.value});
    }

    onNameDown(event: React.KeyboardEvent<HTMLInputElement>) : void {
        if (event.keyCode !== 13)
            return;

        const child = this.state.editingName;

        event.preventDefault();
        (event.target as HTMLInputElement).readOnly = true;
        this.setState({editingName: null});

        let cwd = this.currentNode().path.split('/');
        if (cwd[0] === 'root')
            cwd = cwd.slice(1, cwd.length);

        let node = this.state.tree;
        for (const pos of this.state.position) {
            const next = this.find(node, pos);
            if (next === node)
                break;

            node = next;
        }

        if (!child)
            return;

        cwd.push(child.path.split('/').slice(-1)[0]);

        fetch(`${api_url}/storage/rename/${cwd.join('/')}`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'x-access-token': Auth.getToken()
            },
            body: JSON.stringify({
                name: this.state.name
            })
        })
            .then((res) => res.json())
            .then(() => {
                if (!this._isMounted)
                    return;

                this.fetchTree();
            });
    }

    handleNodeActionClick(event: ClickEvent<HTMLDivElement>) : void {
        let target = event.target as unknown as HTMLElement;
        let id = -1;
        let action = '';

        while (target.parentElement) {
            if (target.id && target.id.includes('-actions')) {
                id = parseInt(target.id.split('.')[1]);
                break;
            }

            const classList = target.classList;

            if (!classList)
                continue;

            if (classList[0] === 'file-rename')
                action = 'rename';

            if (classList[0] === 'file-edit')
                action = 'edit';

            if (classList[0] === 'file-delete')
                action = 'delete';

            target = target.parentElement as HTMLElement;
        }

        if (action === '')
            return;

        if (id === -1)
            return;

        if (action === 'edit') {
            console.log('EDIT ACTION NOT IMPLEMENTED');
            return;
        }

        if (action === 'rename') {
            let nodeElement: HTMLInputElement | null = null;
            if (target.parentElement)
                nodeElement = target.parentElement.childNodes[1] as HTMLInputElement;

            if (!nodeElement)
                return;

            const node = this.currentNode().children[id];

            nodeElement.readOnly = false;
            this.setState({name: node.file, editingName: node});
            nodeElement.select();

            return;
        }

        let cwd = this.currentNode().path.split('/');
        if (cwd[0] === 'root')
            cwd = cwd.slice(1, cwd.length);

        let node = this.state.tree;
        for (const pos of this.state.position) {
            const next = this.find(node, pos);
            if (next === node)
                break;

            node = next;
        }

        const child = node.children[id];
        cwd.push(child.path.split('/').slice(-1)[0]);

        fetch(`${api_url}/storage/${action}/${cwd.join('/')}`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'x-access-token': Auth.getToken()
            },
            body: JSON.stringify({
                path: 'RENAME TO...'
            })
        })
            .then((res) => res.json())
            .then(() => {
                if (!this._isMounted)
                    return;

                this.fetchTree();
            });
    }

    handleTreeClick(event: ClickEvent<HTMLInputElement>) : void {
        if (this.state.editingName)
            return;

        const target = event.target;
        const value = target.value;

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
                <Preview cwd={this.currentNode()} types={this.state.types} handleNodeActionClick={this.handleNodeActionClick}/>
            </div>
        );
    }
}

export default Explorer;
