import axios from "axios";
import moment from "moment";
import React from "react";
import { Comment, Image } from "semantic-ui-react";
import noUserImg from "../../img/no-user-image.jpg";

const isOwnMessage = (message, user) => {
    return message.user?.id === user?.uid ? "message__self" : "";
};

const isImage = (message) =>
    message.hasOwnProperty("image") && !message.hasOwnProperty("content");

const timeFromNow = (timestamp) => moment(timestamp).fromNow();

const getImage = (message) => {
    // axios.get(message.user.avatar).then((res) => console.log(res.data));
};

const Message = ({ message, user }) => (
    <Comment>
        <Comment.Avatar
            src={message.user.avatar ? message.user.avatar : noUserImg}
            onError={getImage(message)}
        />
        <Comment.Content className={isOwnMessage(message, user)}>
            <Comment.Author as="a">{message.user.name}</Comment.Author>
            <Comment.Metadata>
                {timeFromNow(message.timestamp)}
            </Comment.Metadata>
            {isImage(message) ? (
                <Image src={message.image} className="message__image" />
            ) : (
                <Comment.Text>{message.content}</Comment.Text>
            )}
        </Comment.Content>
    </Comment>
);

export default Message;
