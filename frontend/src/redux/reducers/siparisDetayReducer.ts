// Path: @/redux/reducers/siparisDetayReducer.ts
import * as actionTypes from "../actions/actionTypes";
import initialState from "./initialState";

export default function siparisDetayReducer(state = initialState.seciliSiparis, action) {
    switch (action.type) {
        case actionTypes.GET_SIPARIS_BY_ID_SUCCESS:
            return action.payload;
        case actionTypes.EDIT_SIPARIS_SUCCESS:
            return action.payload;
        default:
            return state;
    }
}