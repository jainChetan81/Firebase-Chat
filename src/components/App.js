import "./App.css";
import { Grid } from "semantic-ui-react";
import React from "react";
import ColorPanel from "./ColorPanel";
import SidePanel from "./SidePanel";
import Messages from "./Messages";
import MetaPanel from "./MetaPanel";
import { connect } from "react-redux";

const App = ({
    currentUser,
    currentChannel,
    isPrivateChannel,
    userPosts,
    primary,
    secondary,
}) => (
    <Grid columns="equal" className="app" style={{ background: secondary }}>
        <ColorPanel
            key={currentUser ? currentUser.name : "ColorPanel"}
            currentUser={currentUser}
        />
        <SidePanel currentUser={currentUser} primary={primary} />
        <Grid.Column style={{ marginLeft: 320 }}>
            <Messages />
        </Grid.Column>
        <Grid.Column width={4}>
            <MetaPanel />
        </Grid.Column>
    </Grid>
);

const mapStateToProps = (state) => ({
    currentUser: state.user.currentUser,
    currentChannel: state.channel.currentChannel,
    isPrivateChannel: state.channel.isPrivateChannel,
    userPosts: state.channel.currentPost,
    primary: state.colors.primary,
    secondary: state.colors.secondary,
});

export default connect(mapStateToProps)(App);
