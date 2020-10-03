import React, { Component } from "react";
import { Button, Input, Segment } from "semantic-ui-react";
import firebase from "../../firebase";
class MessageForm extends Component {
    state = {
        user: this.props.user,
        message: "",
        loading: false,
        channel: this.props.channel,
        errors: [],
    };

    createMessage = () => {
        const message = {
            content: this.state.message,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: this.props.user.uid,
                name: this.props.user.displayName,
                avatar: this.props.user.photoURL,
            },
        };
        return message;
    };

    handleChange = (event) => {
        event.preventDefault();
        this.setState({ [event.target.name]: event.target.value });
    };

    sendMessage = (e) => {
        e.preventDefault();
        const { messagesRef, channel } = this.props;
        const { message, errors } = this.state;
        if (message) {
            this.setState({ loading: true });
            console.log();
            messagesRef
                .child(channel.id)
                .push()
                .set(this.createMessage())
                .then(() =>
                    this.setState({ loading: false, message: "", errors: [] })
                )
                .catch((err) => {
                    console.warn("err", err);
                    this.setState({
                        errors: errors.concat(err),
                        loading: false,
                    });
                });
        }
        if (!message) {
            console.log("else !message", message);
            this.setState({
                errors: this.state.errors.concat({ message: "Add a message!" }),
            });
        }
    };
    render() {
        const { errors, message, loading } = this.state;
        return (
            <Segment className="message__form">
                <Input
                    fluid
                    name="message"
                    value={message}
                    onChange={this.handleChange}
                    style={{ marginBottom: "0.7em" }}
                    label={<Button icon="add" />}
                    className={
                        errors.some((error) =>
                            error.message.includes("message")
                        )
                            ? "error"
                            : ""
                    }
                    labelPosition="left"
                    placeholder="Write your Message"
                />
                <Button.Group icon width="2">
                    <Button
                        onClick={this.sendMessage}
                        labelPosition="left"
                        disabled={loading}
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
