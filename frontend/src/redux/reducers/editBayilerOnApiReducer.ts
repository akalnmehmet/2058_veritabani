// Path: @/redux/reducers/editBayilerOnApiReducer.ts
import * as actionTypes from "../actions/actionTypes"
import initialState from "./initialState";

export default function editBayilerOnApiReducer (state=initialState.bayiler,action){
    switch (action.type){
        case actionTypes.EDIT_BAYILER_ON_API:
            return action.payload

        default:
            return state;
    }
}