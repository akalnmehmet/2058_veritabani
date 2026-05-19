// Path: @/redux/reducers/getSelectedFromProjelerTableReducer.ts
import * as actionTypes from "../actions/actionTypes";

export default function getSelectedFromProjelerTableReducer (state=[],action){
    switch (action.type){
        case actionTypes.GET_SELECTED_FROM_PROJELERTABLE:
            console.log("getSelectedFromProjelerTableReducer çalıştı")
            return action.payload

        default:
            return state;


    }
}
