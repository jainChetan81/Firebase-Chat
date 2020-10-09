import React, { Component, Fragment } from "react";
import { Comment, Segment } from "semantic-ui-react";
import MessageForm from "./MessageForm";
import MessagesHeader from "./MessagesHeader";
import firebase from "../../firebase";
import { connect } from "react-redux";
import Message from "./Message";
import { setUserPosts } from "../../actions";
import Typing from "./Typing";
import Skeleton from "./Skeleton";

class Messages extends Component {
    state = {
        messagesRef: firebase.database().ref("messages"),
        usersRef: firebase.database().ref("users"),
        privateMessagesRef: firebase.database().ref("privateMessages"),
        typingRef: firebase.database().ref("typing"),
        connectedRef: firebase.database().ref(".info/connected"),
        messages: [],
        messagesLoading: true,
        progressBar: false,
        numUniqueUsers: 0,
        isChannelStarred: false,
        searchTerm: "",
        searchLoading: false,
        searchResults: [],
        typingUsers: [],
        listeners: [],
    };

    componentDidUpdate(prevProps, prevState) {
        const { channel, currentUser } = this.props;
        if (this.messagesEnd) {
            this.scrollToBottom();
        }
        if (channel !== prevProps.channel) {
            this.setState({ typingUsers: [] });
            if (channel && currentUser) {
                // this.removeListener(this.state.listeners);
                this.addMessageListeners(channel?.id);
                this.addTypingListeners(channel?.id);
                this.addUserStarrListeners(channel?.id, currentUser?.uid);
            }
        }
    }

    componentWillUnmount() {
        this.removeListener(this.state.listeners);
        this.state.connectedRef.off();
    }

    addToListeners = (id, ref, event) => {
        const index = this.state.listeners.findIndex(
            (listener) => listener.id === id && listener.ref === ref
        );

        if (index !== -1) {
            const newListener = { id, ref, event };
            this.setState({
                listeners: this.state.listeners.concat(newListener),
            });
        }
    };

    removeListener = (listeners) => {
        listeners.map((listener) =>
            listener.ref.child(listener.id).off(listener.event)
        );
    };

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    };

    addTypingListeners = (channelId) => {
        let typingUsers = [];
        const { typingRef, connectedRef } = this.state;

        typingRef.child(channelId).on("child_added", (snap) => {
            if (snap.key !== this.props.currentUser?.uid) {
                typingUsers = typingUsers.concat({
                    id: snap.key,
                    name: snap.val(),
                });
                this.setState({ typingUsers });
            }
        });
        this.addToListeners(channelId, typingRef, "child_added");

        typingRef.child(channelId).on("child_removed", (snap) => {
            const index = typingUsers.findIndex((user) => user.id === snap.key);
            if (index !== -1) {
                typingUsers = typingUsers.filter(
                    (user) => user.id !== snap.key
                );
                this.setState({ typingUsers });
            }
        });
        this.addToListeners(channelId, typingRef, "child_removed");

        connectedRef.on("value", (snap) => {
            if (snap.val() === true) {
                typingRef
                    .child(channelId)
                    .child(this.props.currentUser?.uid)
                    .onDisconnect()
                    .remove((err) => {
                        if (err !== null) {
                            console.error(err);
                        }
                    });
            }
        });
    };

    displayTypingUsers = (users) =>
        users.length > 0 &&
        users.map((user) => (
            <div
                key={user.id}
                style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "0.2em",
                }}>
                <span className="user__typing">{user.name} is typing</span>
                <Typing />
            </div>
        ));

    addUserStarrListeners = (channelId, userId) => {
        this.state.usersRef
            .child(userId)
            .child("starred")
            .once("value")
            .then((data) => {
                if (data.val() !== null) {
                    const channelIds = Object.keys(data.val());
                    const prevStarred = channelIds.includes(channelId);
                    this.setState({ isChannelStarred: prevStarred });
                }
            });
    };

    handleStarr = () => {
        this.setState(
            (prevState) => ({
                isChannelStarred: !prevState.isChannelStarred,
            }),
            () => {
                this.starrChannel();
            }
        );
    };

    starrChannel = () => {
        if (this.state.isChannelStarred) {
            this.state.usersRef
                .child(`${this.props.currentUser?.uid}/starred`)
                .update({
                    [this.props.channel.id]: {
                        name: this.props.channel.name,
                        details: this.props.channel.details,
                        createdBy: {
                            name: this.props.channel.createdBy.name,
                            avatar: this.props.channel.createdBy.avatar,
                        },
                    },
                });
        } else {
            this.state.usersRef
                .child(`${this.props.currentUser?.uid}/starred`)
                .child(this.props.channel.id)
                .remove((err) => {
                    if (err !== null) {
                        console.error(err);
                    }
                });
        }
    };

    displayChannelName = () =>
        this.props.channel
            ? `${this.props.isPrivateChannel ? "@" : "#"}   ${
                  this.props.channel.name
              }`
            : "Channel(0)";

    getMessagesRef = () => {
        const { privateMessagesRef, messagesRef } = this.state;
        const { isPrivateChannel } = this.props;
        return isPrivateChannel ? privateMessagesRef : messagesRef;
    };

    addMessageListeners = (channelId) => {
        let loadedMessages = [];
        const ref = this.getMessagesRef();
        let flag = 0;
        ref.child(channelId).on("child_added", (snap) => {
            loadedMessages.push(snap.val());
            flag = 1;
            this.setState({
                messages: loadedMessages,
                messagesLoading: false,
            });
            this.countUniqueUsers(loadedMessages);
            this.countUserPosts(loadedMessages);
        });
        this.addToListeners(channelId, ref, "child_added");
        if (flag === 0) {
            this.setState({
                messages: [],
                messagesLoading: false,
            });
        }
    };

    handleSearchChange = (e) => {
        this.setState(
            {
                searchTerm: e.target.value,
                searchLoading: true,
            },
            () => {
                this.handleSearchMessages();
            }
        );
    };

    handleSearchMessages = () => {
        const channelMessages = [...this.state.messages];
        const regex = new RegExp(this.state.searchTerm, "gi");
        const searchResults = channelMessages.reduce((acc, message) => {
            if (
                (message.content && message.content.match(regex)) ||
                message.user.name.match(regex)
            ) {
                acc.push(message);
            }
            return acc;
        }, []);
        this.setState({ searchResults });
        setTimeout(() => this.setState({ searchLoading: false }), 1000);
    };

    countUniqueUsers = (messages) => {
        const uniqueUsers = messages.reduce((acc, message) => {
            if (!acc.includes(message.user.name)) {
                acc.push(message.user.name);
            }
            return acc;
        }, []);
        const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
        const numUniqueUsers = `${uniqueUsers.length} ${
            plural ? "users" : "user"
        }`;
        this.setState({ numUniqueUsers });
    };

    countUserPosts = (messages) => {
        let userPosts = messages.reduce((acc, message) => {
            if (message.user.name in acc) {
                acc[message.user.name].count++;
            } else {
                acc[message.user.name] = {
                    avatar: message.user.avatar,
                    count: 1,
                };
            }
            return acc;
        }, {});
        this.props.setUserPosts(userPosts);
    };

    displayMessages = (messages) => {
        return (
            messages.length > 0 &&
            messages.map((message, index) => (
                <Message
                    style={{ width: "100%" }}
                    key={index}
                    message={message}
                    user={this.props.currentUser}
                />
            ))
        );
    };

    isProgresBarVisible = (percent) => {
        if (percent > 0) this.setState({ progressBar: true });
    };

    displayMessageSkeleton = (loading) =>
        loading ? (
            <Fragment>
                {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} />
                ))}
            </Fragment>
        ) : null;

    render() {
        //prettier-ignore
        const {messages, progressBar, numUniqueUsers, searchResults, searchLoading, isChannelStarred, typingUsers, messagesLoading} = this.state;
        return (
            <Fragment>
                <MessagesHeader
                    handleSearchChange={this.handleSearchChange}
                    displayChannelName={this.displayChannelName}
                    numUniqueUsers={numUniqueUsers}
                    searchLoading={searchLoading}
                    isPrivateChannel={this.props.isPrivateChannel}
                    isChannelStarred={isChannelStarred}
                    handleStarr={this.handleStarr}
                />
                <Segment>
                    <Comment.Group
                        className={
                            progressBar ? "messages__progress" : "messages"
                        }>
                        {this.displayMessageSkeleton(messagesLoading)}
                        {searchResults.length > 0
                            ? this.displayMessages(searchResults)
                            : this.displayMessages(messages)}
                        {this.displayTypingUsers(typingUsers)}
                        <div ref={(node) => (this.messagesEnd = node)} />{" "}
                    </Comment.Group>
                </Segment>
                <MessageForm
                    isProgresBarVisible={this.isProgresBarVisible}
                    getMessagesRef={this.getMessagesRef}
                />
            </Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    channel: state.channel.currentChannel,
    currentUser: state.user.currentUser,
    isPrivateChannel: state.channel.isPrivateChannel,
});

export default connect(mapStateToProps, { setUserPosts })(Messages);
