import React, { Component, Fragment } from "react";
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
import { setColors } from "../../actions";
import { SliderPicker } from "react-color";
import firebase from "../../firebase";
class ColorPanel extends Component {
    state = {
        modal: false,
        primary: "",
        secondary: "",
        user: this.props.currentUser,
        usersRef: firebase.database().ref("users"),
        userColors: [],
    };

    componentDidMount() {
        if (this.state.user) {
            this.addListener(this.state.user.uid);
        }
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        const { currentUser } = this.props;
        if (currentUser !== prevProps.currentUser) {
            if (currentUser) {
                this.addListeners(currentUser?.uid);
            }
        }
    }
    componentWillUnmount() {
        this.removeListener();
    }

    // removeListener = () => {
    //     this.state.usersRef
    //         .child(`${this.props.currentUser?.uid}/colors`)
    //         .off();
    // };
    removeListener = () => {
        if (this.state.user)
            this.state.usersRef.child(`${this.state.user.uid}/colors`).off();
    };

    addListener = (userId) => {
        let userColors = [];
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

    displayUserColors = (colors) =>
        colors.length > 0 &&
        colors.map((color, i) => (
            <Fragment key={i}>
                <Divider />
                <div
                    className="color__container"
                    style={{ background: color.primary }}>
                    <div
                        className="color__square"
                        onClick={() =>
                            this.props.setColors(color.primary, color.secondary)
                        }>
                        <div
                            className="color__overlay"
                            style={{ background: color.secondary }}></div>
                    </div>
                </div>
            </Fragment>
        ));

    handleSaveColors = () => {
        const { primary, secondary, usersRef } = this.state;
        if (primary && secondary) {
            usersRef
                // .child(`${this.props.currentUser?.uid}/colors`)
                .child(`${this.state.user.uid}/colors`)
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
        const { modal, primary, secondary, userColors } = this.state;
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
                {this.displayUserColors(userColors)}

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
    // currentUser: state.user.currentUser,
});

export default connect(mapStateToProps, { setColors })(ColorPanel);
