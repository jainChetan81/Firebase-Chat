import React, { Component } from "react";
import { Icon, Menu } from "semantic-ui-react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions";

class StarredComponent extends Component {
    state = {
        starredChannels: [],
        messagesRef: firebase.database().ref("messages"),
        usersRef: firebase.database().ref("users"),
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { currentUser } = this.props;
        if (currentUser !== prevProps.currentUser) {
            if (currentUser) {
                this.addListeners(currentUser?.uid);
            }
        }
    }
    componentWillUnmount() {
        if (this.props.currentUser && this.state.starredChannels.length > 0)
            this.removeListeners();
    }

    removeListeners = () => {
        this.state.usersRef
            .child(`${this.props.currentUser?.uid}/starred`)
            .off();
        this.state.starredChannels.forEach((channel) => {
            this.state.messagesRef.child(channel.id).off();
        });
    };

    addListeners = (userId) => {
        this.state.usersRef
            .child(userId)
            .child("starred")
            .on("child_added", (snap) => {
                const starredChannel = { id: snap.key, ...snap.val() };
                this.setState({
                    starredChannels: [
                        ...this.state.starredChannels,
                        starredChannel,
                    ],
                });
            });
        this.state.usersRef
            .child(userId)
            .child("starred")
            .on("child_removed", (snap) => {
                const channeToRemove = { id: snap.key, ...snap.val() };
                const filteredChannels = this.state.starredChannels.filter(
                    (channel) => {
                        return channel.id !== channeToRemove.id;
                    }
                );
                this.setState({
                    starredChannels: filteredChannels,
                });
            });
    };

    changeChannel = (channel) => {
        this.props.setCurrentChannel(channel); //set current channel
        this.props.setPrivateChannel(false);
    };

    displayChannels = (starredChannels) => {
        return (
            starredChannels.length > 0 &&
            starredChannels.map((starredChannel) => (
                <Menu.Item
                    key={starredChannel.id}
                    name={starredChannel.name}
                    style={{ opacity: 0.7 }}
                    onClick={() => this.changeChannel(starredChannel)}>
                    #{starredChannel.name}
                </Menu.Item>
            ))
        );
    };

    render() {
        const { starredChannels } = this.state;
        return (
            <Menu.Menu className="menu">
                <Menu.Item>
                    <span>
                        <Icon name="star" />
                        {"  "}Starred
                    </span>
                    ({starredChannels.length})
                </Menu.Item>
                {this.displayChannels(starredChannels)}
            </Menu.Menu>
        );
    }
}

const mapStateToProps = (state) => ({
    currentUser: state.user.currentUser,
});

export default connect(mapStateToProps, {
    setCurrentChannel,
    setPrivateChannel,
})(StarredComponent);
