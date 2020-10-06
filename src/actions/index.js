import * as actionTypes from "./types";
export const setUser = (user) => {
    return {
        type: actionTypes.SET_USER,
        currentUser: user,
    };
};
export const clearUser = () => {
    return {
        type: actionTypes.ClEAR_USER,
    };
};

//channet action creators
export const setCurrentChannel = (channel) => {
    return { type: actionTypes.SET_CURRENT_CHANNEL, currentChannel: channel };
};
export const setPrivateChannel = (isPrivateChannel) => {
    return { type: actionTypes.SET_PRIVATE_CHANNEL, isPrivateChannel };
};

//user post action creators
export const setUserPosts = (posts) => {
    return { type: actionTypes.SET_USER_POSTS, posts };
};
