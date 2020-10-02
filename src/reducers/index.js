import * as actionTypes from "../actions/types";
import { combineReducers } from "redux";

const initialState = {
    currentUser: null,
    isLoading: true,
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.SET_USER:
            return {
                currentUser: action.currentUser,
                isLoading: false,
            };

        default:
            return state;
    }
};
const rootReducer = combineReducers({
    user: userReducer,
});
export default rootReducer;
