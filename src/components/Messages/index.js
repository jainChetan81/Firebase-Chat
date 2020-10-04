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
        numUniqueUsers: 0,
        searchTerm: "",
        searchLoading: false,
        searchResults: [],
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { channel, currentUser } = this.props;
        if (channel !== prevProps.channel) {
            if (channel || currentUser) this.addMessageListeners(channel.id);
        }
    }

    displayChannelName = () =>
        this.props.channel ? `#${this.props.channel.name}` : "Channel(0)";

    addMessageListeners = (channelId) => {
        let loadedMessages = [];
        this.state.messagesRef.child(channelId).on("child_added", (snap) => {
            loadedMessages.push(snap.val());
            this.setState({
                messages: [...loadedMessages],
                messagesLoading: false,
            });
            this.countUniqueUsers(loadedMessages);
        });
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
        // if (this.state.searchTerm.length > 0) {
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
        // } else {
        //     this.setState({
        //         searchTerm: "",
        //         searchLoading: false,
        //         searchResults: [],
        //     });
        // }
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
        //prettier-ignore
        const { messagesRef,messages,progressBar,numUniqueUsers,searchResults,searchLoading} = this.state;
        return (
            <Fragment>
                <MessagesHeader
                    handleSearchChange={this.handleSearchChange}
                    displayChannelName={this.displayChannelName}
                    numUniqueUsers={numUniqueUsers}
                    searchLoading={searchLoading}
                />
                <Segment>
                    <Comment.Group
                        className={
                            progressBar ? "messages__progress" : "messages"
                        }>
                        {searchResults.length > 0
                            ? this.displayMessages(searchResults)
                            : this.displayMessages(messages)}
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
