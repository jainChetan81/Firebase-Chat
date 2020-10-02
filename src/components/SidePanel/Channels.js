import React, { Component, Fragment } from "react";
import { Button, Form, Icon, Input, Menu, Modal } from "semantic-ui-react";

class Channels extends Component {
    state = { channels: [], modal: false, channelName: "", channelDetails: "" };
    openModal = () => {
        this.setState({ modal: true });
    };
    closeModal = () => {
        this.setState({ modal: false });
    };
    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };
    render() {
        const { channels, modal, channelName, channelDetails } = this.state;
        return (
            <Fragment>
                <Menu.Menu style={{ paddingBottom: "2em" }}>
                    <Menu.Item>
                        <span>
                            <Icon name="exchange" /> CHANNELS
                        </span>
                        ({channels.length})
                        <Icon name="add" onClick={this.openModal} />
                    </Menu.Item>
                </Menu.Menu>
                <Modal basic open={modal}>
                    <Modal.Header>Add a Channel</Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Field>
                                <Input
                                    fluid
                                    label="Name of Channel"
                                    name="channelName"
                                    value={channelName}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field>
                                <Input
                                    fluid
                                    label="Details of Channel"
                                    name="channelDetails"
                                    value={channelDetails}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color="green" inverted>
                            <Icon name="checkmark" />
                            Add
                        </Button>
                        <Button color="red" inverted onClose={this.closeModal}>
                            <Icon name="remove" />
                            Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Fragment>
        );
    }
}

export default Channels;
