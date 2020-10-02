import React, { Component } from "react";
import firebase from "../../firebase";
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

class Login extends Component {
    state = {
        email: "",
        password: "",
        errors: [],
        loading: false,
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
    isFormValid = (state) => {
        let errors = [];
        let error;
        if (this.isFormEmpty(state)) {
            error = { message: "Fill in all the details" };
            this.setState({ errors: errors.concat(error) });
            return false;
        }
        if (!this.isPasswordValid(state)) {
            error = { message: "Password isn't Valid" };
            this.setState({ errors: errors.concat(error) });
            return false;
        }
        return true;
    };
    isPasswordValid = ({ password }) => {
        if (password.length < 6) return false;
        return true;
    };
    isFormEmpty = ({ email, password }) => {
        return !email.length || !password.length;
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
        if (this.isFormValid(this.state)) {
            this.setState({ errors: [], loading: true });
            firebase
                .auth()
                .signInWithEmailAndPassword(
                    this.state.email,
                    this.state.password
                )
                .then((signedInUser) => {
                    console.log("signedInUser", signedInUser);
                    this.setState({
                        errors: [],
                        loading: false,
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
        const { email, password, errors, loading } = this.state;
        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{ maxWidth: 450 }}>
                    <Header as="h1" icon color="violet" textAlign="center">
                        <Icon name="code branch" color="violet" />
                        Login to Devchat
                    </Header>
                    <Form size="large" onSubmit={this.handleSubmit}>
                        <Segment stacked>
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
                            <Button
                                className={loading ? "loading" : ""}
                                disabled={loading ? true : false}
                                color="violet"
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
                        New User? <Link to="/register">Register</Link>{" "}
                    </Message>
                </Grid.Column>
            </Grid>
        );
    }
}
export default Login;
