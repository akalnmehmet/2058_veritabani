// Path: @/redux/reducers/getProjeFromApiReducer.ts
import * as actionTypes from "../actions/actionTypes";
import initialState from "./initialState";

export default function getProjeFromApiReducer (state=initialState.proje,action){
    switch (action.type){
        case actionTypes.GET_PROJE_FROM_API:
            return action.payload

        default:
            return state;

    }
}