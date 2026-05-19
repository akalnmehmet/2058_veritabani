// Path: @/redux/reducers/getDigerMalzemelerFromApiReducer.ts
import * as actionTypes from "../actions/actionTypes";
import initialState from "./initialState";

export default function getDigerMalzemelerFromApiReducer (state=initialState.diger_malzemeler,action){
    switch (action.type){
        case actionTypes.GET_DIGER_MALZEMELER_FROM_API:
            return action.payload

        default:
            return state;


    }
}