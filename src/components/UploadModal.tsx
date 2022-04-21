import React, { ChangeEvent } from "react";

import Modal from "./Modal";

import UploadIcon from "mdi-material-ui/Upload";

import "../style/Modal.css";

class UploadModal extends Modal<ModalProps> {
  constructor(props: ModalProps) {
    super(props);

    this.handleFileChange = this.handleFileChange.bind(this);
  }

  handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    this.setState({
      data: {
        ...this.state.data,
        files: event.target.files,
      },
    });
  }

  labelText(): string {
    if (!this.state.data.files) return "Choose files...";

    if ((this.state.data.files as FileList).length === 1)
      return ((this.state.data.files as FileList)[0] as File).name;

    return (this.state.data.files as FileList).length + " files...";
  }

  render(): JSX.Element {
    return (
      <div className="Modal" onClick={this.handleClick}>
        <form
          className="modal-content"
          onSubmit={(data) => {
            this.handleSubmit(data);
            this.props.hide();
          }}
        >
          <input
            type="file"
            multiple
            name="file"
            id="file"
            onChange={this.handleFileChange}
            required
          />
          <label htmlFor="file" className="input-border">
            <UploadIcon />
            <span>{this.labelText()}</span>
          </label>
          <input type="submit" value="Upload" />
        </form>
      </div>
    );
  }
}

export default UploadModal;
