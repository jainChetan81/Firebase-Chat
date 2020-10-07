import "./App.css";
import { Grid } from "semantic-ui-react";
import React from "react";
import ColorPanel from "./ColorPanel";
import SidePanel from "./SidePanel";
import Messages from "./Messages";
import MetaPanel from "./MetaPanel";
import { connect } from "react-redux";

const App = ({ primary, secondary }) => (
    <Grid columns="equal" className="app" style={{ background: secondary }}>
        <ColorPanel />
        <SidePanel primary={primary} />
        <Grid.Column style={{ marginLeft: 320 }}>
            <Messages />
        </Grid.Column>
        <Grid.Column width={4}>
            <MetaPanel />
        </Grid.Column>
    </Grid>
);

const mapStateToProps = (state) => ({
    primary: state.colors.primary,
    secondary: state.colors.secondary,
});

export default connect(mapStateToProps)(App);
