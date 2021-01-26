import React from 'react';

class StorageLink extends React.Component<StorageLinkProps> {
    constructor(props: StorageLinkProps) {
        super(props);
    }

    render() : JSX.Element {
        return (
            <a onClick={() => { this.props.callback(this.props.href); }}>{this.props.children}</a>
        );
    }
}

export default StorageLink;
