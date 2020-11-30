import React, { Component } from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import {
    BrowserRouter as Router,
    Route,
    Switch,
    withRouter,
} from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import "semantic-ui-css/semantic.min.css";
import firebase from "./firebase";
import { createStore } from "redux";
import { Provider, connect } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "./reducers/index";
import { setUser, clearUser } from "./actions";
import Spinner from "./Spinner/Spinner";

const store = createStore(rootReducer, composeWithDevTools());
class Root extends Component {
    componentDidMount() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.props.setUser(user);
                this.props.history.push("/");
            } else {
                this.props.history.push("/login");
                this.props.clearUser();
            }
        });
    }
    render() {
        return this.props.isLoading ? (
            <Spinner />
        ) : (
            <Switch>
                <Route exact path="/" component={App} />
                <Route path="/Login" component={Login} />
                <Route path="/Register" component={Register} />
            </Switch>
        );
    }
}
const mapStateToProps = (state) => ({
    isLoading: state.user.isLoading,
});
const RootWithAuth = connect(mapStateToProps, { setUser, clearUser })(
    withRouter(Root)
);
ReactDOM.render(
    <Provider store={store}>
        <Router>
            <RootWithAuth />
        </Router>
    </Provider>,
    document.getElementById("root")
);

//TODO:avatar storage problems
