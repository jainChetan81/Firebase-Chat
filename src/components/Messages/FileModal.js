import React, { Component } from "react";
import { Button, Icon, Input, Modal } from "semantic-ui-react";
import mime from "mime-types";

class FileModal extends Component {
    state = { file: null, authorized: ["image/jpeg", "image/png"] };

    addFile = (event) => {
        const file = event.target.files[0];
        if (file) {
            this.setState({ file });
        }
    };

    isAuthorized = (fileName) =>
        this.state.authorized.includes(mime.lookup(fileName));

    sendFile = () => {
        const { file } = this.state;
        if (file !== null) {
            if (this.isAuthorized(file.name)) {
                const metadata = { contentType: mime.lookup(file.name) };
                this.props.uploadFile(file, metadata);
                this.setState({ file: null });
                this.props.closeModal();
            }
        }
    };

    render() {
        const { modal, closeModal } = this.props;
        return (
            <Modal basic open={modal} onClose={closeModal}>
                <Modal.Header>Select an Image File</Modal.Header>
                <Modal.Content>
                    <Input
                        onChange={this.addFile}
                        fluid
                        label="File types: .jpeg, .png"
                        name="file"
                        type="file"
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button color="green" inverted onClick={this.sendFile}>
                        <Icon name="checkmark" />
                        Send
                    </Button>
                    <Button color="red" inverted onClick={closeModal}>
                        <Icon name="remove" />
                        Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default FileModal;
