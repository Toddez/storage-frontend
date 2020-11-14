import React, { RefObject } from 'react';

import Modal from './Modal';

import '../style/Modal.css';

class CreateModal extends Modal {
    constructor(props: ModalProps) {
        super(props);

        this.pathRef = React.createRef();
    }

    pathRef: RefObject<HTMLInputElement>;

    state: FormState = {
        data: {
            path: ''
        }
    }

    componentDidMount() : void {
        this.setState({data: {path: this.path(this.props.cwd)}});
    }

    componentDidUpdate() : void {
        if (this.pathRef.current) {
            const targetStr = this.props.data.type & this.props.data.types.FILE ? 'filename' : 'directory';

            if (this.pathRef.current.value === this.path(this.props.cwd)) {
                this.pathRef.current.select();
                this.pathRef.current.setSelectionRange(this.pathRef.current.value.length - targetStr.length, this.pathRef.current.value.length);
            }
        }
    }

    path(node: TreeNode) : string {
        const spl = node.path.split('/');
        let str = spl.slice(1, spl.length).join('/');
        str += spl.length > 1 ? '/' : '';
        str += this.props.data.type & this.props.data.types.FILE ? 'filename' : 'directory';

        return str;
    }

    render() : JSX.Element {
        return (
            <a className='Modal' onClick={this.handleClick}>
                <form className='modal-content create' onSubmit={(data) => { this.handleSubmit(data); this.props.hide(); }}>
                    <div className='cwd'>~/</div>
                    <input ref={this.pathRef} type="text" name="path" id="path" value={this.state.data.path} onChange={this.handleChange} autoFocus />
                    <input hidden type="submit" value="Create" />
                </form>
            </a>
        );
    }
}

export default CreateModal;
