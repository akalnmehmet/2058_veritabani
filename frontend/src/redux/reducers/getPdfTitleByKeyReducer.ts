// Path: @/redux/reducers/getPdfTitleByKeyReducer.ts
import * as actionTypes from "../actions/actionTypes";

/**
 * Amaç: actionsPdf.getPdfTitleByKey(key) başarılı olduğunda
 * gelen veriyi (title objesi) state'e doğrudan yazmak.
 *
 * Notlar:
 * - Başlangıç state'i {} (boş obje).
 * - Sadece SUCCESS action'ını dinliyoruz; senin mevcut reducer stilinle uyumlu.
 * - İstersen REQUEST/FAILURE için de case ekleyebiliriz, ama şu an bire bir aynı mantığı izliyorum.
 */
export default function getPdfTitleByKeyReducer(state = {}, action) {
  switch (action.type) {
    case actionTypes.GET_PDF_TITLE_BY_KEY_SUCCESS:
      // Örn: payload { id, key, config_json, ... } olabilir → olduğu gibi yaz
      return action.payload;

    default:
      return state;
  }
}
