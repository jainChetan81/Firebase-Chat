import React, { Component } from "react";
import firebase from "../../firebase";
import { Dropdown, Grid, Header, Icon, Image } from "semantic-ui-react";
import { connect } from "react-redux";

class UserPanel extends Component {
    dropDownOptions = () => [
        {
            key: "user",
            text: (
                <span>
                    Signed in as
                    <strong> {this.props.currentUser?.displayName}</strong>
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
            text: <span onClick={this.onSignOut}>Sign Out</span>,
        },
    ];
    onSignOut = () => {
        firebase
            .auth()
            .signOut()
            .then(() => console.log("Sign Out!!"))
            .catch((err) => {
                console.warn("err", err);
            });
    };

    render() {
        const { currentUser } = this.props;
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
                            trigger={
                                <span>
                                    <Image
                                        src={currentUser?.photoURL}
                                        spaced="right"
                                        avatar
                                    />
                                    {currentUser?.displayName}
                                </span>
                            }
                            options={this.dropDownOptions()}
                        />
                    </Header>
                </Grid.Column>
            </Grid>
        );
    }
}
const mapStateToProps = (state) => ({
    currentUser: state.user.currentUser,
});

export default connect(mapStateToProps)(UserPanel);
