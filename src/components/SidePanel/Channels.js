import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import {
    Button,
    Form,
    Icon,
    Input,
    Menu,
    Message,
    Modal,
} from "semantic-ui-react";
import firebase from "../../firebase";
import { setCurrentChannel } from "../../actions";

class Channels extends Component {
    state = {
        channels: [],
        activeChannel: "",
        modal: false,
        channelName: "",
        channelDetails: "",
        channelsRef: firebase.database().ref("channel"),
        errors: [],
        loading: false,
    };
    componentDidMount() {
        this.addListeners();
    }

    componentWillUnmount() {
        this.removeListeners();
    }

    removeListeners = () => {
        this.state.channelsRef.off();
    };

    addListeners = () => {
        let loadedChannels = [];
        this.state.channelsRef.on("child_added", (snap) => {
            loadedChannels.push(snap.val());
            this.setState({ channels: [...loadedChannels] }, () =>
                this.setFirstChannel()
            );
        });
    };
    setFirstChannel = () => {
        if (this.state.channels.length > 0) {
            this.changeChannel(this.state.channels[0]);
        }
    };
    changeChannel = (channel) => {
        this.props.setCurrentChannel(channel);
        this.setState({ activeChannel: channel.id });
    };

    addChannel = () => {
        const { channelsRef, channelName, channelDetails } = this.state;
        const key = channelsRef.push().key;
        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: this.props.currentUser.displayName,
                avatar: this.props.currentUser.photoURL,
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

const mapStateToProps = (state) => ({
    currentUser: state.user.currentUser,
});

export default connect(mapStateToProps, { setCurrentChannel })(Channels);
