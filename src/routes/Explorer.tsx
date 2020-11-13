import React from 'react';

import Auth from '../models/auth';
import { api_url, theme } from '../models/config';

import EditIcon from '@material-ui/icons/EditOutlined';
import DeleteIcon from '@material-ui/icons/DeleteOutlined';

import { CodeBlock } from 'react-code-blocks';

type State = {
    tree: Record<string, unknown>,
    types: Record<string, unknown>
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
        types: {}
    }

    componentWillUnmount() : void {
        this._isMounted = false;
    }

    render() : JSX.Element {
        return (
            <div className='Explorer'>
                <div className='navigation'>
                    <div className='path'>root/test/</div>
                    <div className='add-file'><a>Add file</a></div>
                </div>
                <div className='files'>
                    <div className='header'>
                        <div className='file-info'>
                            <div className='file-lines'>35 lines</div>
                            <div className='inline-seperator'></div>
                            <div className='file-size'>1.65 KB</div>
                        </div>
                        <div className='file-action'>
                            <div className='file-raw'>Raw</div>
                            <div className='file-edit'><EditIcon /></div>
                            <div className='file-delete'><DeleteIcon /></div>
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
