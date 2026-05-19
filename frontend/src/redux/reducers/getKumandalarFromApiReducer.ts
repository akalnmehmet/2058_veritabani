// Path: @/redux/reducers/getKumandalarFromApiReducer.ts
import * as actionTypes from "../actions/actionTypes"
import initialState from "./initialState";

export default function getKumandalarFromApiReducer (state=initialState.kumandalar,action){
    switch (action.type){
        case actionTypes.GET_KUMANDALAR_FROM_API:
            return action.payload

        default:
            return state;


    }
}