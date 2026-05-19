// Path: @/redux/reducers/getProfileColorsFromApiReducer.ts
import * as actionTypes from "../actions/actionTypes"
import initialState from "./initialState";

export default function getProfileColorsFromApiReducer (state=initialState.profileColors,action){
    switch (action.type){
        case actionTypes.GET_PROFILE_BOYALAR_FROM_API:
            return action.payload

        default:
            return state;


    }
}