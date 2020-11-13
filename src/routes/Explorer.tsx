import React from 'react';

import Auth from '../models/auth';
import { api_url, theme } from '../models/config';

import EditIcon from '@material-ui/icons/EditRounded';
import DeleteIcon from '@material-ui/icons/DeleteOutlined';
import NewIcon from '@material-ui/icons/AddBoxRounded';
import UploadIcon from '@material-ui/icons/PublishRounded';
import FileIcon from '@material-ui/icons/InsertDriveFileOutlined';

import { CodeBlock } from 'react-code-blocks';

import '../style/Explorer.css';

type State = {
    tree: Record<string, unknown>,
    types: Record<string, unknown>,
    position: Array<Record<string, unknown>>
}

class Explorer extends React.Component {
    _isMounted = false;

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

                console.log(res.tree);

                this.setState({tree: res.tree, types: res.types});
            });
    }

    state: State = {
        tree: {},
        types: {},
        position: []
    }

    componentWillUnmount() : void {
        this._isMounted = false;
    }

    render() : JSX.Element {
        return (
            <div className='Explorer'>
                <div className='tree'>
                    <div className='navigation'>
                        <div className='path'>
                            <a className='item'>root</a>
                            <div className='path-seperator'></div>
                            <a className='item'>test</a>
                            <div className='path-seperator'></div>
                            <a className='item active'>index.tsx</a>
                        </div>
                        <div className='navigation-actions'>
                            <div className='add-file'><a><NewIcon /></a></div>
                            <div className='upload-file'><a><UploadIcon /></a></div>
                        </div>
                    </div>
                    <div className='nodes'>
                        <a className='node go-up'><div className='name'>..</div></a>
                        <div className='node'><div className='icon'><FileIcon /></div><a className='name'>index.tsx</a></div>
                        <div className='node'><div className='icon'><FileIcon /></div><a className='name'>index.css</a></div>
                    </div>
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
