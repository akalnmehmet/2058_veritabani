// Path: @/redux/reducers/getSystemFullVariantsOfSystemFromApiReducer.ts
import * as actionTypes from "../actions/actionTypes"
import initialState from "./initialState";

export default function getSystemFullVariantsOfSystemFromApiReducer(state = initialState.fullvariantsofsystem, action) {
  switch (action.type) {
    case actionTypes.FULL_VARIANT_OF_SYSTEM:
      return action.payload

    default:
      return state;


  }
}