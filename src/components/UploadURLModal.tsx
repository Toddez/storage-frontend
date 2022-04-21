import React from "react";

import Modal from "./Modal";

import "../style/Modal.css";

class UploadURLModal extends Modal<ModalProps> {
  constructor(props: ModalProps) {
    super(props);
  }

  state: FormState = {
    data: {
      url: "",
    },
  };

  render(): JSX.Element {
    return (
      <div className="Modal" onClick={this.handleClick}>
        <form
          className="modal-content create"
          onSubmit={(data) => {
            this.handleSubmit(data);
            this.props.hide();
          }}
        >
          <input
            type="text"
            name="url"
            id="url"
            value={this.state.data.url as string}
            onChange={this.handleChange}
            autoFocus
            spellCheck={false}
            required
          />
          <div className="input-border"></div>
          <input hidden type="submit" value="Upload" />
        </form>
      </div>
    );
  }
}

export default UploadURLModal;
