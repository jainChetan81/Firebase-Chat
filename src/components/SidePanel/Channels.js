import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import {
    Button,
    Form,
    Icon,
    Input,
    Label,
    Menu,
    Message,
    Modal,
} from "semantic-ui-react";
import firebase from "../../firebase";

class Channels extends Component {
    state = {
        channels: [],
        activeChannel: "",
        user: this.props.currentUser,
        modal: false,
        channelName: "",
        channelDetails: "",
        channelsRef: firebase.database().ref("channel"),
        messagesRef: firebase.database().ref("messages"),
        typingRef: firebase.database().ref("typing"),
        notifications: [],
        errors: [],
        loading: false,
    };

    componentDidMount() {
        this.addListeners();
    }

    componentWillUnmount() {
        console.log("cwm in channels");
        this.removeListeners();
    }

    removeListeners = () => {
        this.state.channelsRef.off();
        this.state.channels.forEach((channel) => {
            this.state.messagesRef.child(channel.id).off();
        });
    };

    addListeners = () => {
        let loadedChannels = [];
        this.state.channelsRef.on("child_added", (snap) => {
            loadedChannels.push(snap.val());
            this.setState({ channels: [...loadedChannels] }, () =>
                this.setFirstChannel()
            );
            this.addNotificationListener(snap.key);
        });
    };

    addNotificationListener = (channelId) => {
        this.state.messagesRef.child(channelId).on("value", (snap) => {
            if (this.props.channel) {
                this.handleNotifications(
                    channelId,
                    this.props.channel.id,
                    this.state.notifications,
                    snap
                );
            }
        });
    };

    //prettier-ignore
    handleNotifications = (channelId, currentChannelId, notifications, snap) => {
        let lastTotal = 0;
        let index = notifications.findIndex(
            (notification) => notification.id === channelId
        );
        if (index !== -1) {
            if (channelId !== currentChannelId) {
                lastTotal = notifications[index].total;
                if (snap.numChildren() - lastTotal > 0) {
                    notifications[index].count = snap.numChildren() - lastTotal;
                }
            }
            notifications[index].lastKnownTotal = snap.numChildren();
        } else {
            notifications.push({
                id: channelId,
                total: snap.numChildren(),
                lastKnownTotal: snap.numChildren(),
                count: 0,
            });
        }
        this.setState({ notifications });
    };

    getNotificationCount = (channel) => {
        let count = 0;
        this.state.notifications.forEach((notification) => {
            if (notification.id === channel.id) {
                count = notification.count;
            }
        });
        if (count > 0) return count;
    };

    setFirstChannel = () => {
        if (this.state.channels.length > 0) {
            this.changeChannel(this.state.channels[0]);
        }
    };
    changeChannel = (channel) => {
        this.props.setCurrentChannel(channel); //set current channel
        this.clearNotifications();
        if (this.props.channel)
            this.state.typingRef
                .child(this.props.channel.id)
                .child(this.state.user?.uid)
                .remove();
        this.props.setPrivateChannel(false);
        this.setState({ activeChannel: channel.id, channel, channelName: "" }); //set active channel
    };

    clearNotifications = () => {
        let index = this.state.notifications.findIndex(
            (notification) => notification.id === this.props.channel.id
        );
        if (index !== -1) {
            let updatedNotifications = [...this.state.notifications];
            //prettier-ignore
            updatedNotifications[index].total=this.state.notifications[index].lastKnownTotal
            updatedNotifications[index].count = 0;
            this.setState({ notifications: updatedNotifications });
        }
    };

    addChannel = () => {
        const { channelsRef, channelName, channelDetails } = this.state;
        const key = channelsRef.push().key;
        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: this.state.user.displayName,
                avatar: this.state.user.photoURL,
            },
        };
        channelsRef
            .child(key)
            .update(newChannel)
            .then(() => {
                this.setState({
                    channelName: "",
                    channelDetails: "",
                });
                this.closeModal();
                console.log("channel added");
                this.setState({ errors: [], loading: false });
            })
            .catch((err) => {
                console.warn("err", err);
                this.setState({
                    errors: this.state.errors.concat(err),
                    loading: false,
                });
            });
    };

    handleSubmit = (e) => {
        e.preventDefault();
        if (this.isFormValid(this.state)) {
            this.setState({ errors: [], loading: true });
            this.addChannel();
        }
    };

    displayChannels = (channels) => {
        return (
            channels.length > 0 &&
            channels.map((channel) => (
                <Menu.Item
                    key={channel.id}
                    name={channel.name}
                    active={channel.id === this.state.activeChannel}
                    style={{ opacity: 0.7 }}
                    onClick={() => this.changeChannel(channel)}>
                    {this.getNotificationCount(channel) && (
                        <Label color="red">
                            {this.getNotificationCount(channel)}
                        </Label>
                    )}
                    #{channel.name}
                </Menu.Item>
            ))
        );
    };

    isFormValid = ({ channelName, channelDetails }) => {
        let errors = [];
        let error;
        if (this.isChannelEmpty(channelName, channelDetails)) {
            error = { message: "Fill in all the details" };
            this.setState({ errors: errors.concat(error) });
            return false;
        }
        return true;
    };

    displayErrors = (errors) => {
        return errors.map((err, index) => {
            console.log("err.message : ", JSON.stringify(err.message));
            return <p key={index}>{err.message}</p>;
        });
    };

    isPasswordValid = ({ password }) => {
        if (password.length < 6) return false;
        return true;
    };

    isChannelEmpty = (channelName, channelDetails) => {
        return !channelName.length || !channelDetails.length;
    };

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
        const {
            channels,
            modal,
            channelName,
            channelDetails,
            errors,
            loading,
        } = this.state;
        return (
            <Fragment>
                <Menu.Menu className="menu">
                    <Menu.Item>
                        <span>
                            <Icon name="exchange" /> CHANNELS
                        </span>
                        ({channels.length})
                        <Icon name="add" onClick={this.openModal} />
                    </Menu.Item>
                    {this.displayChannels(channels)}
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
                        {errors.length > 0 && (
                            <Message error>
                                <h3>Error</h3>
                                {this.displayErrors(errors)}
                            </Message>
                        )}
                    </Modal.Content>
                    <Modal.Actions>
                        <Button
                            color="green"
                            className={loading ? "loading" : ""}
                            disabled={loading ? true : false}
                            inverted
                            onClick={this.handleSubmit}>
                            <Icon name="checkmark" />
                            Add
                        </Button>
                        <Button color="red" inverted onClick={this.closeModal}>
                            <Icon name="remove" />
                            Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Fragment>
        );
    }
}

export default connect(null, {
    setCurrentChannel,
    setPrivateChannel,
})(Channels);
