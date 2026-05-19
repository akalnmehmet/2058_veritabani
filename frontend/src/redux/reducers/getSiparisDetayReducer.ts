// Path: @/redux/reducers/getSiparisDetayReducer.ts

import * as actionTypes from "../actions/actionTypes";
import initialState from "./initialState";

export default function getSiparisDetayReducer(state = initialState.siparisDetay, action) {
  switch (action.type) {
    case actionTypes.GET_SIPARIS_BY_ID_SUCCESS:
      return action.payload; // API'den gelen veriyi doğrudan state'e yazıyoruz
    default:
      return state;
  }
}