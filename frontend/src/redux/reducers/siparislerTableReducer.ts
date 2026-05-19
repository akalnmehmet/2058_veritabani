// Path: @/redux/reducers/siparislerTableReducer.ts
import * as actionTypes from "../actions/actionTypes";
import initialState from "./initialState";

// Bu reducer, sadece tablo için çekilen birleştirilmiş sipariş listesini tutar.
export default function siparislerTableReducer(state = initialState.siparislerForTable, action) {
    switch (action.type) {
        case actionTypes.GET_SIPARISLER_FOR_TABLE_SUCCESS:
            return action.payload;
        default:
            return state;
    }
}