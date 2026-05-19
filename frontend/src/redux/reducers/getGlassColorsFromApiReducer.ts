// Path: @/redux/reducers/getGlassColorsFromApiReducer.ts
import * as actionTypes from "../actions/actionTypes"
import initialState from "./initialState";

export default function getGlassColorsFromApiReducer(state=initialState.glassColors,action){
    switch (action.type){
        case actionTypes.GET_GLASS_BOYALAR_FROM_API:
            return action.payload

        default:
            return state;


    }
}