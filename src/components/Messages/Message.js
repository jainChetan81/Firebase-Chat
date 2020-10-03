import moment from "moment";
import React from "react";
import { Comment } from "semantic-ui-react";

const Message = ({ message, user }) => {
    const isOwnMessage = () =>
        message.user.id === user.uid ? "message__self" : "";

    const timeFromNow = () => moment(message.timestamp).fromNow();

    return (
        <Comment>
            <Comment.Avatar src={message.user.avatar} />
            <Comment.Content className={isOwnMessage()}>
                <Comment.Author as="a">{message.user.name}</Comment.Author>
                <Comment.Metadata>{timeFromNow()}</Comment.Metadata>
                <Comment.Text>{message.content}</Comment.Text>
            </Comment.Content>
        </Comment>
    );
};

export default Message;
