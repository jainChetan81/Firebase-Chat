import React from "react";
import { Menu } from "semantic-ui-react";
import UserPanel from "./UserPanel";
import Channels from "./Channels";
import DirectMessages from "./DirectMessages";
import StarredComponent from "./StarredComponent";

function SidePanel() {
    return (
        <Menu
            size="large"
            inverted
            fixed="left"
            vertical
            style={{ background: "#4c3c4c", fontSize: "1.2rem" }}>
            <UserPanel />
            <StarredComponent />
            <Channels />
            <DirectMessages />
        </Menu>
    );
}

export default SidePanel;
