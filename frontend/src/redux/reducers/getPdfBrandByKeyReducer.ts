// Path: @/redux/reducers/getPdfBrandByKeyReducer.ts
import * as actionTypes from "../actions/actionTypes";

/**
 * Amaç: actionsPdf.getPdfBrandByKey(key) başarılı olduğunda
 * gelen veriyi (brand objesi) state'e doğrudan yazmak.
 */
export default function getPdfBrandByKeyReducer(state = {}, action) {
  switch (action.type) {
    case actionTypes.GET_PDF_BRAND_BY_KEY_SUCCESS:
      return action.payload;

    default:
      return state;
  }
}
