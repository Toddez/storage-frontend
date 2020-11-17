import React, { RefObject } from 'react';

import Modal from './Modal';

import '../style/Modal.css';

interface CreateModalProps extends ModalProps {
    cwd: TreeNode,
    data: {
        type: number,
        types: Record<string, number>
    }
}

const filePlaceholder = 'filename';
const dirPlaceholder = 'directory/';

class CreateModal extends Modal<CreateModalProps> {
    constructor(props: CreateModalProps) {
        super(props);

        this.props = props;
        this.pathRef = React.createRef();
    }

    props: CreateModalProps;
    pathRef: RefObject<HTMLInputElement>;

    state: FormState = {
        data: {
            path: '',
            first: true
        },
    }

    componentDidMount() : void {
        this.setState({data: {...this.state.data, path: this.path(this.props.cwd)}});
    }

    componentDidUpdate() : void {
        if (this.pathRef.current) {
            let target = '';
            if (this.props.data.type & this.props.data.types.FILE)
                target = filePlaceholder;

            if (this.props.data.type & this.props.data.types.DIR)
                target = dirPlaceholder;

            const current = this.pathRef.current.value;

            if (current === this.path(this.props.cwd) && this.state.data.first) {
                this.pathRef.current.select();
                this.pathRef.current.setSelectionRange(current.length - target.length, current.length);

                this.setState({data: {...this.state.data, first: false}});
            }
        }
    }

    path(node: TreeNode) : string {
        const spl = node.path.split('/');
        let str = spl.slice(1, spl.length).join('/');
        str += spl.length > 1 ? '/' : '';
        str += this.props.data.type & this.props.data.types.FILE ? filePlaceholder : dirPlaceholder;

        return str;
    }

    render() : JSX.Element {
        const filePattern = '([.]{0,1}[A-Za-z0-9]+)+([A-Za-z0-9]|([./][A-Za-z0-9]))*';
        const dirPattern = '[A-Za-z0-9]+([A-Za-z0-9]|([/][A-Za-z0-9])|([/]$))*';

        const pattern = this.props.data.type & this.props.data.types.FILE ? filePattern : dirPattern;

        return (
            <div className='Modal' onClick={this.handleClick}>
                <form className='modal-content create' onSubmit={(data) => { this.handleSubmit(data); this.props.hide(); }}>
                    <div className='cwd'>~/</div>
                    <input ref={this.pathRef}
                        type="text"
                        name="path"
                        id="path"
                        value={this.state.data.path as string}
                        onChange={this.handleChange}
                        autoFocus spellCheck={false} required pattern={pattern} />
                    <div className='input-border'></div>
                    <input hidden type="submit" value="Create" />
                </form>
            </div>
        );
    }
}

export default CreateModal;
