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
