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
        progressBar: false,
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
        });
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

    render() {
        const { messagesRef, messages, progressBar } = this.state;
        return (
            <Fragment>
                <MessagesHeader />
                <Segment>
                    <Comment.Group
                        className={
                            progressBar ? "messages__progress" : "messages"
                        }>
                        {this.displayMessages(messages)}
                    </Comment.Group>
                </Segment>
                <MessageForm
                    messagesRef={messagesRef}
                    isProgresBarVisible={this.isProgresBarVisible}
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
