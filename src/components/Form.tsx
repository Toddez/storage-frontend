import React, { ChangeEvent, FormEvent } from 'react';

type State = {
    data: Record<string, unknown>
}

abstract class Form extends React.Component {
    constructor(props: Record<string, unknown>) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    state: State = {
        data: {}
    }

    abstract onSubmit(): void;

    handleChange(event: ChangeEvent<HTMLInputElement>) : void {
        const target = event.target;
        if (!target)
            return;

        const name = target.name;
        const value = target.value;

        this.setState({
            data: {
                ...this.state.data,
                [name]: value
            }
        });
    }

    handleSubmit(event: FormEvent<HTMLFormElement>) : void {
        event.preventDefault();

        this.onSubmit();
    }

    abstract render() : JSX.Element;
}

export default Form;
