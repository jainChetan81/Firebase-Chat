import React, { Component } from "react";
import {
    Accordion,
    Header,
    Icon,
    Image,
    List,
    Segment,
} from "semantic-ui-react";
import { connect } from "react-redux";

class MetaPanel extends Component {
    state = {
        activeIndex: 1,
        privateChannel: false,
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { isPrivateChannel } = this.props;
        if (isPrivateChannel !== prevProps.isPrivateChannel) {
            if (isPrivateChannel) this.setState({ privateChannel: true });
            else this.setState({ privateChannel: false });
        }
    }

    setActiveIndex = (e, titleProps) => {
        const { index } = titleProps;
        const { activeIndex } = this.state;
        const newIndex = activeIndex === index ? -1 : index;
        this.setState({ activeIndex: newIndex });
    };

    displayToPosters = (post) => {
        return Object.entries(post)
            .sort((a, b) => b[1] - a[1])
            .map(([key, value], i) => (
                <List.Item key={i}>
                    <Image avatar src={value.avatar} />
                    <List.Content>
                        <List.Header as="a">{key}</List.Header>
                        <List.Description>
                            {this.formatCount(value.count)}
                        </List.Description>
                    </List.Content>
                </List.Item>
            ));
    };

    formatCount = (count) => (count !== 1 ? `${count} posts` : `${count} post`);

    render() {
        const { activeIndex, privateChannel } = this.state;
        const { channel, currentPost } = this.props;
        if (privateChannel || !channel) return null;
        return (
            <Segment loading={!channel}>
                <Header as="h3" attached="top">
                    About # {channel?.name}
                </Header>
                <Accordion styled attached="true">
                    <Accordion.Title
                        active={activeIndex === 0}
                        index={0}
                        onClick={this.setActiveIndex}>
                        <Icon name="dropdown" />
                        <Icon name="info" />
                        Channel Details
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 0}>
                        {channel?.details}
                    </Accordion.Content>
                    <Accordion.Title
                        active={activeIndex === 1}
                        index={1}
                        onClick={this.setActiveIndex}>
                        <Icon name="dropdown" />
                        <Icon name="user circle" />
                        Top Posters
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 1}>
                        <List>
                            {currentPost && this.displayToPosters(currentPost)}
                        </List>
                    </Accordion.Content>
                    <Accordion.Title
                        active={activeIndex === 2}
                        index={2}
                        onClick={this.setActiveIndex}>
                        <Icon name="dropdown" />
                        <Icon name="pencil alternate" />
                        Created By
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 2}>
                        <Header as="h3">
                            <Image circular src={channel?.createdBy?.avatar} />
                            {channel?.createdBy?.name}
                        </Header>
                    </Accordion.Content>
                </Accordion>
            </Segment>
        );
    }
}

const mapStateToProps = (state) => ({
    isPrivateChannel: state.channel.isPrivateChannel,
    channel: state.channel.currentChannel,
    currentPost: state.channel.currentPost,
});

export default connect(mapStateToProps)(MetaPanel);
