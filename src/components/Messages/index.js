import React, { Component, Fragment } from "react";
import { Comment, Segment } from "semantic-ui-react";
import MessageForm from "./MessageForm";
import MessagesHeader from "./MessagesHeader";
import firebase from "../../firebase";

class Messages extends Component {
    state = {
        messagesRef: firebase.database().ref("messages"),
    };
    render() {
        const { messagesRef } = this.state;
        return (
            <Fragment>
                <MessagesHeader />
                <Segment>
                    <Comment.Group className="messages"></Comment.Group>
                </Segment>
                <MessageForm messagesRef={messagesRef} />
            </Fragment>
        );
    }
}

export default Messages;
