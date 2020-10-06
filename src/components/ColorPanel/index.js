import React, { Component } from "react";
import {
    Sidebar,
    Menu,
    Divider,
    Button,
    Modal,
    Icon,
    Label,
    Segment,
} from "semantic-ui-react";
import { connect } from "react-redux";
import { SliderPicker } from "react-color";
import firebase from "../../firebase";
class ColorPanel extends Component {
    state = {
        modal: false,
        primary: "",
        secondary: "",
        usersRef: firebase.database().ref("users"),
        userColors: [],
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { currentUser } = this.props;
        if (currentUser !== prevProps.currentUser) {
            if (currentUser) {
                this.addListeners(currentUser.uid);
            }
        }
    }

    addListeners = (userId) => {
        let userColors = [];
        console.log(userId);
        this.state.usersRef
            .child(`${userId}/colors`)
            .on("child_added", (snap) => {
                userColors.unshift(snap.val());
                this.setState({ userColors });
            });
    };

    openModal = () => this.setState({ modal: true });

    closeModal = () => this.setState({ modal: false });

    handleChangePrimary = (color) => this.setState({ primary: color.hex });

    handleChangeSecondary = (color) => this.setState({ secondary: color.hex });

    handleSaveColors = () => {
        const { primary, secondary, usersRef } = this.state;
        if (primary && secondary) {
            usersRef
                .child(`${this.props.currentUser.uid}/colors`)
                .push()
                .update({
                    primary,
                    secondary,
                })
                .then(() => {
                    console.log("colors added");
                    this.closeModal();
                })
                .catch((err) => console.error(err));
        }
    };

    render() {
        const { modal, primary, secondary } = this.state;
        return (
            <Sidebar
                as={Menu}
                icon="labeled"
                inverted
                vertical
                visible
                width="very thin">
                <Divider />
                <Button
                    icon="add"
                    size="small"
                    color="blue"
                    onClick={this.openModal}
                />
                {/* colorpicker modal */}
                <Modal basic open={modal} onClose={this.closeModal}>
                    <Modal.Header>Choose App Colors</Modal.Header>
                    <Modal.Content>
                        <Segment inverted>
                            <Label content="Primary Color" />
                            <SliderPicker
                                color={primary}
                                onChange={this.handleChangePrimary}
                            />
                        </Segment>
                        <Segment inverted>
                            <Label content="Secondary Color" />
                            <SliderPicker
                                color={secondary}
                                onChange={this.handleChangeSecondary}
                            />
                        </Segment>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button
                            color="green"
                            inverted
                            onClick={this.handleSaveColors}>
                            <Icon name="checkmark" /> Save Colors
                        </Button>
                        <Button color="red" inverted onClick={this.closeModal}>
                            <Icon name="remove" /> Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Sidebar>
        );
    }
}

const mapStateToProps = (state) => ({
    currentUser: state.user.currentUser,
});

export default connect(mapStateToProps)(ColorPanel);
