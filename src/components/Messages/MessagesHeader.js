import React, { Component } from "react";
import { Header, Icon, Input, Segment } from "semantic-ui-react";

class MessagesHeader extends Component {
    render() {
        //prettier-ignore
        const { displayChannelName, handleSearchChange, numUniqueUsers ,searchLoading,isPrivateChannel, handleStarr, isChannelStarred, searchTerm} = this.props;
        return (
            <Segment clearing>
                <Header
                    fluid="true"
                    as="h2"
                    floated="left"
                    style={{ marginBottom: 0 }}>
                    <span>
                        {displayChannelName()} {"  "}
                        {isPrivateChannel ? (
                            ""
                        ) : (
                            <Icon
                                onClick={handleStarr}
                                name={
                                    isChannelStarred ? "star" : "star outline"
                                }
                                color={isChannelStarred ? "yellow" : "black"}
                            />
                        )}
                    </span>
                    <Header.Subheader>{numUniqueUsers}</Header.Subheader>
                </Header>

                {/* Channel Search Input */}
                <Header floated="right">
                    <Input
                        loading={searchLoading}
                        onChange={handleSearchChange}
                        value={searchTerm}
                        size="mini"
                        icon="search"
                        name="searchTerm"
                        placeholder="Search Messages"
                    />
                </Header>
            </Segment>
        );
    }
}

export default MessagesHeader;
