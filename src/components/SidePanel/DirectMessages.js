import React, { Component } from "react";
import { Icon, Menu } from "semantic-ui-react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions";

class DirectMessages extends Component {
    state = {
        users: [],
        activeChannel: "",
        usersRef: firebase.database().ref("users"),
        connectedRef: firebase.database().ref(".info/connected"),
        presenceRef: firebase.database().ref("presence"),
    };
    
    componentDidUpdate(prevProps, prevState, snapshot) {
        const { currentUser } = this.props;
        if (currentUser !== prevProps.currentUser) {
            if (currentUser) this.addListeners(currentUser.uid);
        }
    }

    addListeners = (currentUserUid) => {
        let loadedUsers = [];
        this.state.usersRef.on("child_added", (snap) => {
            if (currentUserUid !== snap.key) {
                let user = snap.val();
                user["uid"] = snap.key;
                user["status"] = "offline";
                loadedUsers.push(user);
                this.setState({ users: loadedUsers });
            }
            if (currentUserUid === snap.key) {
                //TODO:remove in future
                let user = snap.val();
                user.name = user.name + " (You)";
                user["uid"] = snap.key;
                user["status"] = "online";
                loadedUsers.push(user);
                this.setState({ users: loadedUsers });
            }
        });

        this.state.connectedRef.on("value", (snap) => {
            if (snap.val() === true) {
                const ref = this.state.presenceRef.child(currentUserUid);
                ref.set(true);
                ref.onDisconnect().remove((err) => {
                    if (err !== null) {
                        console.error(err);
                    }
                });
            }
        });

        this.state.presenceRef.on("child_added", (snap) => {
            if (currentUserUid !== snap.key) {
                this.addStatusToUser(snap.key);
            }
        });

        this.state.presenceRef.on("child_removed", (snap) => {
            if (currentUserUid !== snap.key) {
                this.addStatusToUser(snap.key, false);
            }
        });
    };

    addStatusToUser = (userId, connected = true) => {
        const updatedUsers = this.state.users.reduce((acc, user) => {
            if (user.uid === userId) {
                user["status"] = `${connected ? "online" : "offline"}`;
            }
            return acc.concat(user);
        }, []);
        this.setState({ users: updatedUsers });
    };

    isUserOnline = (user) => user.status === "online";

    changeChannel = (user) => {
        const channelId = this.getChannelId(user.uid);
        const channelData = {
            id: channelId,
            name: user.name,
        };
        this.props.setCurrentChannel(channelData);
        this.props.setPrivateChannel(true);
        this.setActiveChannel(user.uid);
    };
    setActiveChannel = (userID) => {
        this.setState({ activeChannel: userID });
    };

    getChannelId = (uid) => {
        const currenUserID = this.props.currentUser.uid;
        return uid < currenUserID
            ? `${uid}/${currenUserID}`
            : `${currenUserID}/${uid}`;
    };

    render() {
        const { users, activeChannel } = this.state;
        return (
            <Menu.Menu className="menu">
                <Menu.Item>
                    <span>
                        <Icon name="mail" /> Direct Messages
                    </span>
                    ({users.length})
                </Menu.Item>
                {users.map((user) => (
                    <Menu.Item
                        active={user.uid === activeChannel}
                        key={user.uid}
                        onClick={() => this.changeChannel(user)}
                        style={{
                            opacity: "0.7",
                            fontStyle: "italic",
                        }}>
                        <Icon
                            name="circle"
                            color={this.isUserOnline(user) ? "green" : "red"}
                        />
                        @ {user.name}
                    </Menu.Item>
                ))}
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
})(DirectMessages);
