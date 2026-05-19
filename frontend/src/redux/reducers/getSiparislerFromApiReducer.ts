// Path: @/redux/reducers/getSiparislerFromApiReducer.ts
import * as actionTypes from "../actions/actionTypes";
import initialState from "./initialState";

export default function getSiparislerFromApiReducer(state = initialState.siparisler, action) {
    switch (action.type) {
        // Siparişleri ilk getiren action
        case actionTypes.GET_SIPARISLER_FROM_API:
            return action.payload;

        // YENİ EKLENEN CASE: Sipariş silme başarılı olduğunda çalışır
        case actionTypes.DELETE_SIPARIS_SUCCESS:
            // state.filter metodu, mevcut state dizisini dolaşır.
            // ID'si, silinen siparişin ID'sine (action.payload) eşit OLMAYAN
            // tüm siparişleri içeren YENİ bir dizi oluşturur ve döndürür.
            // Bu, state'i doğrudan değiştirmeden (mutate etmeden) güncellemenin doğru yoludur.
            const newState = state.filter(siparis => siparis.id !== action.payload);
            return newState;
            
        default:
            return state;
    }
}