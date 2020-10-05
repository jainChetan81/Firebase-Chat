import * as actionTypes from "../actions/types";
import { combineReducers } from "redux";

const initialUserState = {
    currentUser: null,
    isLoading: false,
};

const userReducer = (state = initialUserState, action) => {
    switch (action.type) {
        case actionTypes.SET_USER:
            return {
                ...state,
                currentUser: action.currentUser,
                isLoading: false,
            };
        case actionTypes.ClEAR_USER:
            return { ...state, currentUser: null, isLoading: false };
        default:
            return state;
    }
};

const initialChannelState = {
    currentChannel: null,
    isPrivateChannel: false,
};

const channelReducer = (state = initialChannelState, action) => {
    switch (action.type) {
        case actionTypes.SET_CURRENT_CHANNEL:
            return { ...state, currentChannel: action.currentChannel };
        case actionTypes.SET_PRIVATE_CHANNEL:
            return { ...state, isPrivateChannel: action.isPrivateChannel };
        default:
            return state;
    }
};
const rootReducer = combineReducers({
    user: userReducer,
    channel: channelReducer,
});
export default rootReducer;
