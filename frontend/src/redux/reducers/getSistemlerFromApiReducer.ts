// Path: @/redux/reducers/getSistemlerFromApiReducer.ts
import * as actionTypes from "../actions/actionTypes"
import initialState from "./initialState";

export default function getSistemlerFromApiReducer (state=initialState.sistemler,action){
    switch (action.type){
        case actionTypes.GET_SISTEMLER_FROM_API:
            return action.payload

        default:
            return state;


    }
}