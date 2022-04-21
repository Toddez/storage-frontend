import React, { ChangeEvent, FormEvent } from "react";

abstract class Form<P> extends React.Component<P> {
  constructor(props: P) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  state: FormState = {
    data: {},
  };

  abstract onSubmit(data: Record<string, unknown>): void;

  handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const target = event.target;
    if (!target) return;

    const name = target.name;
    const value = target.value;

    this.setState({
      data: {
        ...this.state.data,
        [name]: value,
      },
    });
  }

  handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    this.onSubmit(this.state.data as Record<string, unknown>);
  }

  abstract render(): JSX.Element;
}

export default Form;
