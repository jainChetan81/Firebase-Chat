import React, { Component } from "react";
import { Icon, Menu } from "semantic-ui-react";

class DirectMessages extends Component {
    state = { users: [] };
    render() {
        const { users } = this.state;
        return (
            <Menu.Menu className="menu">
                <Menu.Item>
                    <span>
                        <Icon name="mail" /> Direct Messages
                    </span>
                    ({users.length})
                </Menu.Item>
            </Menu.Menu>
        );
    }
}

export default DirectMessages;
