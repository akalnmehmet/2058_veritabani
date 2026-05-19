// Path: @/redux/reducers/systemVariantsOfSystem.ts
import * as actionTypes from "../actions/actionTypes"
import initialState from "./initialState";

export default function systemVariantsOfSystem (state=initialState.systemVariantsOfSystem,action){
    switch (action.type){
        case actionTypes.SYSTEM_VARIANTS_OF_SYSTEM:
            return action.payload

        default:
            return state;


    }
}