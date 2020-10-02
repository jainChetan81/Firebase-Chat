import React, { Component } from "react";
import firebase from "../../firebase";
import md5 from "md5";
import {
    Grid,
    Header,
    Message,
    Icon,
    Form,
    Segment,
    Button,
} from "semantic-ui-react";
import { Link } from "react-router-dom";

class Register extends Component {
    state = {
        username: "",
        email: "",
        password: "",
        passwordConfirm: "",
        errors: [],
        loading: false,
        usersRef: firebase.database().ref("users"),
    };
    handleError = (errors, inputName) => {
        return errors.some((err) =>
            err.message.toLowerCase().includes(inputName)
        )
            ? "error"
            : "";
    };

    onChange = (event) => {
        event.preventDefault();
        this.setState({ [event.target.name]: event.target.value });
    };
    isFormValid = () => {
        let errors = [];
        let error;
        if (this.isFormEmpty(this.state)) {
            error = { message: "Fill in all the details" };
            this.setState({ errors: errors.concat(error) });
            return false;
        }
        if (!this.isPasswordValid(this.state)) {
            error = { message: "Password isn't Valid" };
            this.setState({ errors: errors.concat(error) });
            return false;
        }
        return true;
    };
    isPasswordValid = ({ password, passwordConfirm }) => {
        if (password.length < 6 || passwordConfirm.length < 6) return false;
        if (password !== passwordConfirm) return false;
        return true;
    };
    isFormEmpty = ({ username, email, password, passwordConfirm }) => {
        return (
            !username.length ||
            !email.length ||
            !password.length ||
            !passwordConfirm.length
        );
    };
    displayErrors = (errors) => {
        return errors.map((err, index) => {
            console.log("err.message : ", JSON.stringify(err.message));
            return <p key={index}>{err.message}</p>;
        });
    };
    saveUser = (createdUser) => {
        return this.state.usersRef.child(createdUser.user.uid).set({
            name: createdUser.user.displayName,
            avatar: createdUser.user.photoURL,
        });
    };
    handleSubmit = (e) => {
        e.preventDefault();
        if (this.isFormValid()) {
            this.setState({ errors: [], loading: true });
            firebase
                .auth()
                .createUserWithEmailAndPassword(
                    this.state.email,
                    this.state.password
                )
                .then((createdUser) => {
                    createdUser.user
                        .updateProfile({
                            displayName: this.state.username,
                            photoURL: `http://gravatar.com/avatar/${md5(
                                createdUser.user.email
                            )}?d=identicon`,
                        })
                        .then(() => {
                            this.setState({ errors: [], loading: false });
                            console.log("createdUser", createdUser);
                            this.saveUser(createdUser).then(() =>
                                alert("user saved")
                            );
                        })
                        .catch((err) => {
                            console.warn("err", err);
                            this.setState({
                                errors: this.state.errors.concat(err),
                                loading: false,
                            });
                        });
                })
                .catch((err) => {
                    console.warn("err", err);
                    this.setState({
                        errors: this.state.errors.concat(err),
                        loading: false,
                    });
                });
        }
    };
    render() {
        const {
            username,
            email,
            password,
            passwordConfirm,
            errors,
            loading,
        } = this.state;
        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{ maxWidth: 450 }}>
                    <Header as="h1" icon color="orange" textAlign="center">
                        <Icon name="puzzle piece" color="orange" />
                        Register For Devchat
                    </Header>
                    <Form size="large" onSubmit={this.handleSubmit}>
                        <Segment stacked>
                            <Form.Input
                                fluid
                                name="username"
                                icon="user"
                                iconPosition="left"
                                placeholder="Username"
                                onChange={this.onChange}
                                value={username}
                                type="text"
                                className={this.handleError(errors, "username")}
                            />
                            <Form.Input
                                fluid
                                name="email"
                                icon="mail"
                                iconPosition="left"
                                placeholder="Email Address"
                                onChange={this.onChange}
                                value={email}
                                type="email"
                                className={this.handleError(errors, "email")}
                            />
                            <Form.Input
                                fluid
                                name="password"
                                value={password}
                                icon="lock"
                                iconPosition="left"
                                placeholder="password"
                                onChange={this.onChange}
                                type="password"
                                className={this.handleError(errors, "password")}
                            />
                            <Form.Input
                                fluid
                                name="passwordConfirm"
                                value={passwordConfirm}
                                icon="repeat"
                                iconPosition="left"
                                placeholder="Confirm Password"
                                onChange={this.onChange}
                                type="password"
                                className={this.handleError(errors, "password")}
                            />
                            <Button
                                className={loading ? "loading" : ""}
                                disabled={loading ? true : false}
                                color="orange"
                                fluid
                                size="large">
                                Submit
                            </Button>
                        </Segment>
                    </Form>
                    {errors.length > 0 && (
                        <Message error>
                            <h3>Error</h3>
                            {this.displayErrors(errors)}
                        </Message>
                    )}
                    <Message>
                        Already a User? <Link to="/login">Login</Link>{" "}
                    </Message>
                </Grid.Column>
            </Grid>
        );
    }
}
export default Register;
