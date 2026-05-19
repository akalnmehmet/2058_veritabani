// Path: @/redux/reducers/getMusterilerFromApiReducer.ts
import * as actionTypes from "../actions/actionTypes";
import initialState from "./initialState";

export default function getMusterilerFromApiReducer (state=initialState.musteriler,action){
    switch (action.type){
        case actionTypes.GET_MUSTERILER_FROM_API:
            return action.payload

        default:
            return state;


    }
}