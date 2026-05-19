// Path: @/redux/reducers/getBayilerFromApiReducer.ts
import * as actionTypes from "../actions/actionTypes"
import initialState from "./initialState";

export default function getBayilerFromApiReducer (state=initialState.bayiler,action){
    switch (action.type){
        case actionTypes.GET_BAYILER_FROM_API:
            return action.payload

        default:
            return state;


    }
}