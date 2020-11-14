import React from 'react';

import Modal from './Modal';

import '../style/Modal.css';

class UploadModal extends Modal<ModalProps> {
    constructor(props: ModalProps) {
        super(props);
    }

    render() : JSX.Element {
        return (
            <a className='Modal' onClick={this.handleClick}>
                <form className='modal-content' onSubmit={(data) => { this.handleSubmit(data); this.props.hide(); }}>
                    Unimplemented Modal
                </form>
            </a>
        );
    }
}

export default UploadModal;
