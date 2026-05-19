// Path: @/redux/reducers/getCamlarFromApiReducer.ts
import * as actionTypes from "../actions/actionTypes";
import initialState from "./initialState";

export default function getCamlarFromApiReducer (state=initialState.camlar,action){
    switch (action.type){
        case actionTypes.GET_CAMLAR_FROM_API:
            return action.payload

        default:
            return state;


    }
}