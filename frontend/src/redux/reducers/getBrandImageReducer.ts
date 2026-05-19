// Path: @/redux/reducers/getBrandImageReducer.ts
import * as actionTypes from "../actions/actionTypes";

const initialState = {
  dataUrl: null,     // PNG'in data URL hali
  updatedAt: null,   // ne zaman güncellendi
  error: null,
};

export default function getBrandImageReducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.GET_BRAND_IMAGE_SUCCESS: {
      const dataUrl = action?.payload?.dataUrl ?? null;
      return {
        ...state,
        dataUrl,
        updatedAt: Date.now(),
        error: null,
      };
    }
    default:
      return state;
  }
}