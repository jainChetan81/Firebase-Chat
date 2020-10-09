import React, { Component } from "react";
import { Button, Input, Segment } from "semantic-ui-react";
import firebase from "../../firebase";
import uuidv4 from "uuid/dist/v4";
import { connect } from "react-redux";
import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";
import "emoji-mart/css/emoji-mart.css";
import { emojiIndex, Picker } from "emoji-mart";
class MessageForm extends Component {
    state = {
        message: "",
        loading: false,
        errors: [],
        modal: false,
        uploadState: "",
        uploadTask: null,
        storageRef: firebase.storage().ref(),
        typingRef: firebase.database().ref("typing"),
        percentUploaded: 0,
        emojiPicker: false,
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { channel, user } = this.props;
        if (channel !== prevProps.channel) {
            if (channel) {
                this.state.typingRef
                    .child(channel?.id)
                    .child(user?.uid)
                    .remove();
                this.setState({ message: "" });
            }
        }
    }

    componentWillUnmount() {
        if (this.state.uploadTask !== null) {
            this.state.uploadTask.cancel();
            this.setState({ uploadTask: null });
            this.removeListener();
        }
    }

    openModal = () => {
        this.setState({ modal: true });
    };

    closeModal = () => {
        this.setState({ modal: false });
    };

    getPath = () => {
        if (this.props.isPrivateChannel) {
            return `chat/private/${this.props.channel.id}`;
        } else {
            return `chat/public`;
        }
    };

    uploadFile = (file, metadata) => {
        const pathToUpload = this.props.channel.id;
        const ref = this.props.getMessagesRef();
        const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

        this.setState(
            {
                uploadState: "uploading",
                uploadTask: this.state.storageRef
                    .child(filePath)
                    .put(file, metadata),
            },
            () => {
                this.state.uploadTask.on(
                    "state_changed",
                    (snap) => {
                        const percentUploaded = Math.round(
                            (snap.bytesTransferred / snap.totalBytes) * 100
                        );
                        this.props.isProgresBarVisible(percentUploaded);
                        this.setState({ percentUploaded });
                    },
                    (err) => {
                        console.error(err);
                        this.setState({
                            errors: this.state.errors.concat(err),
                            uploadState: "error",
                            uploadTask: null,
                        });
                    },
                    () => {
                        this.state.uploadTask.snapshot.ref
                            .getDownloadURL()
                            .then((downloadUrl) => {
                                this.sendFileMessage(
                                    downloadUrl,
                                    ref,
                                    pathToUpload
                                );
                            })
                            .catch((err) => {
                                console.error(err);
                                this.setState({
                                    errors: this.state.errors.concat(err),
                                    uploadState: "error",
                                    uploadTask: null,
                                });
                            });
                    }
                );
            }
        );
    };

    sendFileMessage = (fileUrl, ref, pathToUpload) => {
        ref.child(pathToUpload)
            .push()
            .set(this.createMessage(fileUrl))
            .then(() => {
                this.setState({ uploadState: "done" });
            })
            .catch((err) => {
                console.error(err);
                this.setState({
                    errors: this.state.errors.concat(err),
                });
            });
    };

    createMessage = (fileUrl = null) => {
        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: this.props.user?.uid,
                name: this.props.user?.displayName,
                avatar: this.props.user?.photoURL,
            },
        };
        if (fileUrl !== null) {
            message["image"] = fileUrl;
        } else {
            message["content"] = this.state.message;
        }
        return message;
    };

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleKeyDown = (event) => {
        if (event.ctrlKey && event.keyCode === 13) {
            this.sendMessage();
        }

        const { message, typingRef } = this.state;
        const { channel, user } = this.props;
        if (message) {
            typingRef.child(channel?.id).child(user?.uid).set(user.displayName);
        } else {
            typingRef.child(channel?.id).child(user?.uid).remove();
        }
    };

    handleTogglePicker = () => {
        this.setState((prevState) => ({ emojiPicker: !prevState.emojiPicker }));
    };

    handleAddEmoji = (emoji) => {
        const oldMessage = this.state.message;
        const newMessage = this.colonToUnicode(`${oldMessage} ${emoji.colons}`);
        this.setState({ message: newMessage, emojiPicker: false });
        setTimeout(() => this.messageInputRef.focus(), 0);
    };

    colonToUnicode = (message) =>
        message.replace(/:[A-Za-z0-9_+-]+:/g, (x) => {
            x = x.replace(/:/g, "");
            let emoji = emojiIndex.emojis[x];
            if (typeof emoji !== "undefined") {
                let unicode = emoji.native;
                if (typeof unicode !== "undefined") return unicode;
            }
            x = ":" + x + ":";
            return x;
        });

    sendMessage = () => {
        const { getMessagesRef, channel, user } = this.props;
        const { message, errors, typingRef } = this.state;
        if (message) {
            this.setState({ loading: true });
            getMessagesRef()
                .child(channel.id)
                .push()
                .set(this.createMessage())
                .then(() => {
                    this.setState({ loading: false, message: "", errors: [] });
                    typingRef
                        .child(channel?.id)
                        .child(user?.uid)
                        .set(user?.displayName);
                })
                .catch((err) => {
                    console.error(err);
                    this.setState({
                        loading: false,
                        errors: errors.concat(err),
                    });
                });
        }
        if (!message) {
            console.log("else !message", message);
            this.setState({
                errors: errors.concat({ message: "Add a message!" }),
            });
        }
    };
    render() {
        const {
            errors,
            message,
            loading,
            modal,
            percentUploaded,
            uploadState,
            emojiPicker,
        } = this.state;
        return (
            <Segment className="message__form">
                {emojiPicker && (
                    <Picker
                        set="apple"
                        onSelect={this.handleAddEmoji}
                        className="emojipicker"
                        title="Pick You Emoji"
                        emoji="point_up"
                    />
                )}
                <Input
                    fluid
                    ref={(node) => (this.messageInputRef = node)}
                    name="message"
                    value={message}
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}
                    style={{ marginBottom: "0.7em" }}
                    label={
                        <Button
                            icon={emojiPicker ? "close" : "add"}
                            content={emojiPicker ? null : "add"}
                            onClick={this.handleTogglePicker}
                        />
                    }
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
                <Button.Group icon widths="2">
                    <Button
                        onClick={this.sendMessage}
                        labelPosition="left"
                        disabled={loading}
                        icon="edit"
                        color="orange"
                        content="Add reply"
                    />
                    <Button
                        onClick={this.openModal}
                        disabled={uploadState === "uploading"}
                        labelPosition="right"
                        icon="cloud upload"
                        color="teal"
                        content="Upload Media"
                    />
                </Button.Group>
                <FileModal
                    modal={modal}
                    closeModal={this.closeModal}
                    uploadFile={this.uploadFile}
                />
                <ProgressBar
                    percentUploaded={percentUploaded}
                    uploadState={uploadState}
                />
            </Segment>
        );
    }
}

const mapStateToProps = (state) => ({
    channel: state.channel.currentChannel,
    user: state.user.currentUser,
    isPrivateChannel: state.channel.isPrivateChannel,
});

export default connect(mapStateToProps)(MessageForm);
