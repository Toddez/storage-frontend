import React from "react";

class StorageLink extends React.Component<StorageLinkProps> {
  constructor(props: StorageLinkProps) {
    super(props);
  }

  render(): JSX.Element {
    return this.props.local ? (
      <a
        className={`local${this.props.valid ? " valid" : " invalid"}`}
        onClick={() => {
          this.props.callback(this.props.href);
        }}
      >
        {this.props.children}
      </a>
    ) : (
      <a className="external" href={this.props.href}>
        {this.props.children}
      </a>
    );
  }
}

export default StorageLink;
