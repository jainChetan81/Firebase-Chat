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
    currentPost: null,
};

const channelReducer = (state = initialChannelState, action) => {
    switch (action.type) {
        case actionTypes.SET_CURRENT_CHANNEL:
            return { ...state, currentChannel: action.currentChannel };
        case actionTypes.SET_PRIVATE_CHANNEL:
            return { ...state, isPrivateChannel: action.isPrivateChannel };
        case actionTypes.SET_USER_POSTS:
            return { ...state, currentPost: action.posts };
        default:
            return state;
    }
};

const initialColorsState = {
    primary: "#4c3c4c",
    secondary: "#ee",
};

const colorsReducers = (state = initialColorsState, action) => {
    switch (action.type) {
        case actionTypes.SET_COLORS:
            return {
                ...state,
                primary: action.primary,
                secondary: action.secondary,
            };
        default:
            return state;
    }
};

const rootReducer = combineReducers({
    user: userReducer,
    channel: channelReducer,
    colors: colorsReducers,
});
export default rootReducer;
