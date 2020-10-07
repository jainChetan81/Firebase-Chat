import React, { Component } from "react";
import firebase from "../../firebase";
import {
    Button,
    Dropdown,
    Grid,
    Header,
    Icon,
    Image,
    Input,
    Modal,
} from "semantic-ui-react";
import { connect } from "react-redux";

class UserPanel extends Component {
    state = { modal: false };

    openModal = () => this.setState({ modal: true });

    closeModal = () => this.setState({ modal: false });

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
            text: <span onClick={this.openModal}>Change Avatar</span>,
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
        const { modal } = this.state;
        return (
            <Grid
                style={{ background: this.props.primary, fontSize: "1.2rem" }}>
                <Grid.Column>
                    <Grid.Row style={{ padding: "1.2rem", margin: 0 }}>
                        <Header inverted float="left" as="h2">
                            <Icon name="code" />
                            <Header.Content>DevChat</Header.Content>
                        </Header>
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
                    </Grid.Row>

                    {/* change user avatar modal */}
                    <Modal basic open={modal} onClose={this.closeModal}>
                        <Modal.Header>CHange Avatar</Modal.Header>
                        <Modal.Content>
                            <Input
                                fluid
                                type="file"
                                label="new Avatar"
                                name="previewImage"
                            />
                            <Grid centered stackabale columns={2}>
                                <Grid.Row centered>
                                    <Grid.Column className="ui centerd aligned grid">
                                        {/* image provider */}
                                    </Grid.Column>
                                    <Grid.Column>
                                        {/* cropped image preview */}
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Modal.Content>
                        <Modal.Actions>
                            <Button color="green" inverted>
                                <Icon name="save" /> Change Avatar
                            </Button>
                            <Button color="green" inverted>
                                <Icon name="image" /> Preview
                            </Button>
                            <Button
                                color="red"
                                inverted
                                onClick={this.closeModal}>
                                <Icon name="remove" /> Cancel
                            </Button>
                        </Modal.Actions>
                    </Modal>
                </Grid.Column>
            </Grid>
        );
    }
}
const mapStateToProps = (state) => ({
    currentUser: state.user.currentUser,
    primary: state.colors.primary,
    secondary: state.colors.secondary,
});

export default connect(mapStateToProps)(UserPanel);
