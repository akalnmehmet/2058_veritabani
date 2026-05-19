// Path: @/redux/reducers/getProjelerFromApiReducer.ts
import * as actionTypes from "../actions/actionTypes";
import initialState from "./initialState";

export default function getProjelerFromApiReducer (state=initialState.projeler,action){
    switch (action.type){
        case actionTypes.GET_PROJELER_FROM_API:
            return action.payload

        default:
            return state;


    }
}