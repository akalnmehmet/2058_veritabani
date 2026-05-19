// Path: @/redux/reducers/getProfillerFromApiReducer.ts
import * as actionTypes from "../actions/actionTypes";
import initialState from "./initialState";

export default function getProfillerFromApiReducer (state=initialState.profiller,action){
    switch (action.type){
        case actionTypes.GET_PROFILLER_FROM_API:
            return action.payload

        default:
            return state;


    }
}