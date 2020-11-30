import React from "react";
import { Menu } from "semantic-ui-react";
import UserPanel from "./UserPanel";
import Channels from "./Channels";
import DirectMessages from "./DirectMessages";
import StarredComponent from "./StarredComponent";

function SidePanel({ currentUser, primary }) {
    return (
        <Menu
            size="large"
            inverted
            fixed="left"
            vertical
            style={{
                background: primary ? primary : "",
                fontSize: "1.2rem",
            }}>
            <UserPanel primary={primary} currentUser={currentUser} />
            <StarredComponent currentUser={currentUser} />
            <Channels currentUser={currentUser} />
            <DirectMessages currentUser={currentUser} />
        </Menu>
    );
}

export default SidePanel;
