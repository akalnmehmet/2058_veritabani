// Path: @/redux/reducers/getSystemVariantsFromApiReducer.ts
import * as actionTypes from "../actions/actionTypes"
import initialState from "./initialState";

export default function getSystemVariantsFromApiReducer (state=initialState.systemvariants,action){
    switch (action.type){
        case actionTypes.GET_SYSTEM_VARIANTS_FROM_API:
            return action.payload

        default:
            return state;


    }
}