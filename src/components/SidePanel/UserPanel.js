import React, { Component } from "react";
import { Dropdown, Grid, Header, Icon } from "semantic-ui-react";

class UserPanel extends Component {
    state = {};
    dropDownOptions = () => [
        {
            key: "user",
            text: (
                <span>
                    Signed in as <strong>User</strong>
                </span>
            ),
            disabled: true,
        },
        {
            key: "avatar",
            text: <span>Change Avatar</span>,
        },
        {
            key: "signout",
            text: <span>Sign Out</span>,
        },
    ];

    render() {
        return (
            <Grid style={{ background: "#4c3c4c", fontSize: "1.2rem" }}>
                <Grid.Column>
                    <Grid.Row style={{ padding: "1.2rem", margin: 0 }}>
                        <Header inverted float="left" as="h2">
                            <Icon name="code" />
                            <Header.Content>DevChat</Header.Content>
                        </Header>
                    </Grid.Row>
                    {/* User Dropdown */}
                    <Header style={{ padding: "0.25rem" }} as="h3" inverted>
                        <Dropdown
                            trigger={<span>User</span>}
                            options={this.dropDownOptions()}
                        />
                    </Header>
                </Grid.Column>
            </Grid>
        );
    }
}

export default UserPanel;
