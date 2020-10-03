import React, { Component } from "react";
import { Button, Input, Segment } from "semantic-ui-react";

class MessageForm extends Component {
    state = {
        message: "",
        loading: false,
    };
    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };
    sendMessage = (e) => {
        e.preventDefault();
        const { messagesRef } = this.props;
        const { message } = this.state;
        if (message) {
            this.setState({ loading: true });
            messagesRef.channel(channelId);
        }
    };
    render() {
        return (
            <Segment className="message__form">
                <Input
                    fluid
                    name="mesage"
                    onChange={this.handleChange}
                    style={{ marginBottom: "0.7em" }}
                    label={<Button icon="add" />}
                    labelPosition="left"
                    placeholder="Write your Message"
                />
                <Button.Group icon width="2">
                    <Button
                        onClick={this.sendMessage}
                        labelPosition="left"
                        icon="edit"
                        color="orange"
                        content="Add reply"
                    />
                    <Button
                        labelPosition="right"
                        icon="cloud upload"
                        color="teal"
                        content="Upload Media"
                    />
                </Button.Group>
            </Segment>
        );
    }
}

export default MessageForm;
