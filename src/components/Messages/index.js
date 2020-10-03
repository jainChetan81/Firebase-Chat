import React, { Component, Fragment } from "react";
import { Comment, Segment } from "semantic-ui-react";
import MessageForm from "./MessageForm";
import MessagesHeader from "./MessagesHeader";
import firebase from "../../firebase";
import { connect } from "react-redux";
import Message from "./Message";

class Messages extends Component {
    state = {
        messagesRef: firebase.database().ref("messages"),
        messages: [],
        messagesLoading: true,
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { channel, currentUser } = this.props;
        if (channel !== prevProps.channel) {
            if (channel || currentUser) this.addMessageListeners(channel.id);
        }
    }

    addMessageListeners = (channelId) => {
        let loadedMessages = [];
        this.state.messagesRef.child(channelId).on("child_added", (snap) => {
            loadedMessages.push(snap.val());
            this.setState({
                messages: [...loadedMessages],
                messagesLoading: false,
            });
            console.log("loadedMessages", loadedMessages);
        });
    };

    displayMessages = (messages) => {
        return (
            messages.length > 0 &&
            messages.map((message) => (
                <Message
                    key={message.timestamp}
                    message={message}
                    user={this.props.currentUser}
                />
            ))
        );
    };

    render() {
        const { messagesRef, messages, messagesLoading } = this.state;
        return (
            <Fragment>
                <MessagesHeader />
                <Segment>
                    <Comment.Group className="messages">
                        {this.displayMessages(messages)}
                    </Comment.Group>
                </Segment>
                <MessageForm
                    messagesRef={messagesRef}
                    channel={this.props.channel}
                    user={this.props.currentUser}
                />
            </Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    channel: state.channel.currentChannel,
    currentUser: state.user.currentUser,
});

export default connect(mapStateToProps)(Messages);
