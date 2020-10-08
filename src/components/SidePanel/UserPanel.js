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
import uuidv4 from "uuid/dist/v4";
import mime from "mime-types";
import { connect } from "react-redux";
import Avatar from "react-avatar-edit";

class UserPanel extends Component {
    state = {
        modal: false,
        previewImage: "",
        croppedImage: "",
        storageRef: firebase.storage().ref(),
        userRef: firebase.auth().currentUser,
        usersRef: firebase.database().ref("users"),
        metadata: ["image/jpeg", "image/png"],
        uploadedCroppedImage: "",
        file: null,
    };

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

    openModal = () => this.setState({ modal: true });

    closeModal = () =>
        this.setState({
            modal: false,
            croppedImage: "",
            previewImage: "",
            file: null,
        });

    isAuthorized = (fileName) =>
        this.state.metadata.includes(mime.lookup(fileName));

    onBeforeFileLoad = () => {
        const { file } = this.state;
        console.log(
            "mime",
            this.state.metadata.includes(mime.lookup(file.name))
        );
    };

    onCrop = (previewImage) => this.setState({ croppedImage: previewImage });

    // handleCropImage = () => {
    //     if (this.avatarEditor) {
    //         this.avatarEditor.getImageScaledToCanvas().toBlob((blob) => {
    //             let imageUrl = URL.createObjectURL(blob);
    //             console.log("blob", blob);
    //             this.setState({ croppedImage: imageUrl, blob });
    //         });
    //     }
    // };

    uploadCroppedImage = () => {
        //prettier-ignore
        const { storageRef, croppedImage ,uploadedCroppedImage,file} = this.state;
        const metadata = { contentType: mime.lookup(croppedImage.name) };
        const filePath = `avatars/user-${
            this.props.currentUser.uid
        }/${uuidv4()}.jpg`;
        // file.toBlob((blob) => console.log("blob", blob));
        storageRef
            .child(filePath)
            .put(file, metadata)
            .then((snap) => {
                snap.ref.getDownloadURL().then((downloadUrl) => {
                    this.setState({ uploadedCroppedImage: downloadUrl }, () => {
                        this.changeAvatar(downloadUrl);
                    });
                });
            });
    };

    changeAvatar = (imageUrl) => {
        console.log("uploadedCroppedImage", imageUrl);
        this.props.currentUser
            .updateProfile({
                photoURL: imageUrl,
            })
            .then(() => {
                console.log("photo updated");
                this.closeModal();
            })
            .catch((err) => console.error("err :", err));

        this.state.usersRef
            .child(this.props.currentUser.uid)
            .update({ avatar: imageUrl })
            .then(() => {
                console.log("user avatar updated");
            })
            .catch((err) => console.error("err :", err));
    };

    handleChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        // this.setState({ previewImage: "", croppedImage: "" });
        if (file) {
            reader.readAsDataURL(file);
            reader.addEventListener("load", () => {
                console.log("file", file);
                this.setState({ previewImage: reader.result, file });
            });
        }
    };

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
        const { currentUser, primary } = this.props;
        const { modal, previewImage, croppedImage } = this.state;
        return (
            <Grid style={{ background: primary, fontSize: "1.2rem" }}>
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
                                onChange={this.handleChange}
                                type="file"
                                label="new Avatar"
                                name="previewImage"
                            />
                            <Grid centered columns={2}>
                                <Grid.Row centered>
                                    <Grid.Column className="ui center aligned grid">
                                        {previewImage && (
                                            <div>
                                                <Avatar
                                                    width={390}
                                                    height={295}
                                                    onCrop={this.onCrop}
                                                    onClose={this.closeModal}
                                                    src={previewImage}
                                                    //prettier-ignore
                                                    onBeforeFileLoad={ this.onBeforeFileLoad }
                                                />
                                            </div>
                                        )}
                                    </Grid.Column>
                                    <Grid.Column>
                                        {croppedImage && (
                                            <Image
                                                style={{
                                                    margin: "3.5em auto",
                                                }}
                                                width={100}
                                                height={100}
                                                src={croppedImage}></Image>
                                        )}
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Modal.Content>
                        <Modal.Actions>
                            {croppedImage && (
                                <Button
                                    color="green"
                                    inverted
                                    onClick={this.uploadCroppedImage}>
                                    <Icon name="save" /> Change Avatar
                                </Button>
                            )}
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
});

export default connect(mapStateToProps)(UserPanel);
