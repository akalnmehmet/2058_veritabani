// Path: @/redux/reducers/pdfConfigsReducer.ts
import * as actionTypes from "../actions/actionTypes";
import initialState from "./initialState";

export default function pdfConfigsReducer (state=initialState.byKey,action){
  if (action.type === 'pdfConfigs/loaded') {
    const { key, config_json, version, updated_at } = action.payload;
    return {
      ...state,
      byKey: {
        ...state.byKey,
        [key]: { config: config_json, version, updated_at }
      }
    };
  }
  return state;
}