import React from 'react';

import Storage from '../models/storage';
import { pickIcon } from '../models/icon';

import Preview from '../components/Preview';
import CreateModal from '../components/CreateModal';
import UploadModal from '../components/UploadModal';
import UploadURLModal from '../components/UploadURLModal';

import NewFileIcon from 'mdi-material-ui/FilePlusOutline';
import NewFolderIcon from 'mdi-material-ui/FolderPlusOutline';
import UploadIcon from 'mdi-material-ui/FileUploadOutline';
import CloudIcon from 'mdi-material-ui/FileCloudOutline';
import DeleteIcon from '@material-ui/icons/DeleteOutlined';

import '../style/Explorer.css';

type State = {
    tree: TreeNode,
    types: Record<string, NodeType>,
    position: Array<string>,
    displayCreate: boolean,
    displayUpload: boolean,
    displayUploadURL: boolean,
    createType: NodeType,
    name: string,
    editingName: TreeNode | null,
    editingFile: boolean
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
        this.displayUploadURLModal = this.displayUploadURLModal.bind(this);
        this.create = this.create.bind(this);
        this.upload = this.upload.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
        this.onNameDown = this.onNameDown.bind(this);
        this.onEdit = this.onEdit.bind(this);

        Storage.initialize();
        Storage.addFetchListener(this.onStorageFetch.bind(this));
        Storage.addReadListener(this.onStorageFetch.bind(this));
    }

    _isMounted = false;

    state: State = {
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
        displayUploadURL: false,
        createType: 0,
        name: '',
        editingName: null,
        editingFile: false,
    }

    onStorageFetch() : void {
        if (!this._isMounted)
            return;

        this.setState({tree: Storage.root, types: Storage.types, loaded: true});
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

    displayUploadURLModal() : void {
        this.setState({displayUploadURL: true});
    }

    componentDidMount() : void {
        this._isMounted = true;
    }

    componentWillUnmount() : void {
        this._isMounted = false;
    }

    generatePath() : JSX.Element {
        let node = this.state.tree;

        const elements = (
            <div className='path'>
                <div id={`path-item.${0}`} className='item' key={0}>
                    <a onClick={this.handlePathClick}>~</a>/
                </div>
                {this.state.position.map((value, index) => {
                    const next = Storage.findChildNode(node, value);

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

    create(data: Record<string, string>, content: string, type: number | null) : void {
        if (content === '')
            content = '\n';

        Storage.write(data.path, type || this.state.createType, content);
    }

    upload(data: Record<string, unknown>) : void {
        const path = this.currentNode().path.split('/');
        const files = data.files as Array<File>;

        const formData = new FormData();
        for (const file of files) {
            formData.append(`files`, file);
        }

        Storage.upload(path.slice(1, path.length).join('/'), formData);
    }

    uploadFromURL(data: Record<string, string>) : void {
        const url = data.url;
        const path = this.currentNode().path.split('/');

        Storage.uploadFromURL(path.slice(1, path.length).join('/'), url);
    }

    generateCreateModal() : JSX.Element | null {
        if (!this.state.displayCreate)
            return null;

        return (
            <CreateModal
                data={{ type: this.state.createType, types: this.state.types }}
                cwd={this.currentNode()}
                hide={() => this.setState({displayCreate: false})}
                submit={(data) => this.create(data as Record<string, string>, '', null)}
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

    generateUploadURLModal() : JSX.Element | null {
        if (!this.state.displayUploadURL)
            return null;

        return (
            <UploadURLModal hide={() => this.setState({displayUploadURL: false})} submit={(data) => this.uploadFromURL(data as Record<string, string>)} />
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

        const filePattern = '(([.]{0,1}|([.][/]){0,1}|([.][.][/]){0,1})[A-Za-z0-9]+)+([A-Za-z0-9]|([./][A-Za-z0-9]))*';
        const dirPattern = '[A-Za-z0-9]+([A-Za-z0-9]|([/][A-Za-z0-9])|([/]$))*';

        let pattern = '';
        if (this.state.editingName)
            pattern = this.state.editingName.type & this.state.types.FILE ? filePattern : dirPattern;

        return (
            <div className='node' key={index}>
                <div className='icon'>
                    <Icon style={{fill: `var(--color-accent${color})`}}/>
                </div>
                <input type='text' className='name'
                    onClick={this.handleTreeClick}
                    value={this.treeName(node)}
                    onChange={this.onNameChange}
                    onKeyDown={this.onNameDown}
                    readOnly={true} spellCheck={false} required pattern={pattern} ></input>
                <div className='node-border'></div>
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
            const next = Storage.findChildNode(node, pos);
            if (next === node)
                break;

            node = next;
        }

        return (
            <div className='nodes'>
                {node !== this.state.tree ? <div className='node go-up' onClick={this.handleTreeClick}><input type="text" className="name" value=".." readOnly={true}></input></div> : null}
                {Storage.sortNodes(node.children).map(this.generateNode)}
            </div>
        );
    }

    currentNode() : TreeNode {
        return Storage.cwd(this.state.position.join('/'));
    }

    navigate(path: string) : void {
        const pos = path.split('/');
        this.setState({position: pos.filter((a) => a !== '')});
    }

    handlePathClick(event: ClickEvent<HTMLAnchorElement>) : void {
        if (this.state.editingName)
            return;

        if (this.state.displayCreate)
            return;

        if (this.state.displayUpload)
            return;

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
            const next = Storage.findChildNode(node, pos);
            if (next === node)
                break;

            node = next;
        }

        if (!child)
            return;

        cwd.push(child.path.split('/').slice(-1)[0]);

        Storage.rename(cwd.join('/'), this.state.name);
    }

    onEdit(node: TreeNode, data: string) : void {
        let path = node.path.split('/');
        if (path[0] === 'root')
            path = path.slice(1, path.length);

        this.create({path: path.join('/')}, data, this.state.types.FILE);
        this.setState({editingFile: false});
    }

    handleNodeActionClick(event: ClickEvent<HTMLDivElement>) : void {
        if (this.state.editingName)
            return;

        if (this.state.displayCreate)
            return;

        if (this.state.displayUpload)
            return;

        let target = event.target as unknown as HTMLElement;
        let id = -1;
        let action = '';

        while (target.parentElement) {
            const classList = target.classList;

            if (!classList)
                continue;

            if (classList[0] === 'file-rename')
                action = 'rename';

            if (classList[0] === 'file-edit')
                action = 'edit';

            if (classList[0] === 'file-delete')
                action = 'delete';

            if (target.id && target.id.includes('-actions')) {
                id = parseInt(target.id.split('.')[1]);
                break;
            }

            target = target.parentElement as HTMLElement;
        }

        if (action === '')
            return;

        if (id === -1)
            return;

        if (action === 'edit') {
            this.setState({editingFile: true});
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

        if (action === 'delete') {
            let cwd = this.currentNode().path.split('/');
            if (cwd[0] === 'root')
                cwd = cwd.slice(1, cwd.length);

            let node = this.state.tree;
            for (const pos of this.state.position) {
                const next = Storage.findChildNode(node, pos);
                if (next === node)
                    break;

                node = next;
            }

            if (!(node.type & this.state.types.FILE)) {
                const child = node.children[id];
                cwd.push(child.path.split('/').slice(-1)[0]);
            }

            Storage.delete(cwd.join('/'));
        }

        return;
    }

    handleTreeClick(event: ClickEvent<HTMLInputElement>) : void {
        if (this.state.editingName)
            return;

        if (this.state.displayCreate)
            return;

        if (this.state.displayUpload)
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
                {
                    this.generateUploadURLModal()
                }
                { this.state.editingFile ? null : <div className='tree'>
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
                                    <div className='upload-file' onClick={() => this.displayUploadURLModal()}><a><CloudIcon /></a></div>
                                </div>
                                : null
                        }
                    </div>
                    {
                        this.generateNodes()
                    }
                </div>
                }
                <Preview cwd={this.currentNode()} types={this.state.types} handleNodeActionClick={this.handleNodeActionClick} isEditing={this.state.editingFile} onEdit={this.onEdit} />
            </div>
        );
    }
}

export default Explorer;
