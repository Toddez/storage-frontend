import React, { ChangeEvent } from 'react';

import Modal from './Modal';

import '../style/Modal.css';

class UploadModal extends Modal<ModalProps> {
    constructor(props: ModalProps) {
        super(props);

        this.handleFileChange = this.handleFileChange.bind(this);
    }

    handleFileChange(event: ChangeEvent<HTMLInputElement>) : void {
        this.setState({
            data: {
                ...this.state.data,
                files: event.target.files
            }
        });
    }

    render() : JSX.Element {
        return (
            <div className='Modal' onClick={this.handleClick}>
                <form className='modal-content' onSubmit={(data) => { this.handleSubmit(data); this.props.hide(); }}>
                    <input type="file" multiple name="file" id="file" onChange={this.handleFileChange} />
                    <input type="submit" value="Upload"/>
                </form>
            </div>
        );
    }
}

export default UploadModal;
