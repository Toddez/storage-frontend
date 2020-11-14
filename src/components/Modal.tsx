import React from 'react';

import Form from './Form';

import '../style/Modal.css';

abstract class Modal<P> extends Form<ModalProps> {
    constructor(props: P) {
        super(props as unknown as ModalProps);

        this.handleClick = this.handleClick.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(data: Record<string, unknown>) : void {
        this.props.submit(data);
    }

    handleClick(event: ClickEvent) : void {
        const target = event.target;

        if (target.classList.length > 0 && target.classList[0] === 'Modal')
            this.props.hide();
    }

    render() : JSX.Element {
        return (
            <div>Unimplemented Modal</div>
        );
    }
}

export default Modal;
