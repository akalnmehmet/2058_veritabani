// Path: @/redux/reducers/getSystemVariantImageFromApiReducer.ts
import * as actionTypes from "../actions/actionTypes";
import initialState from "./initialState";

const initialSlice = (initialState && initialState.systemVariantImage) || {};

export default function getSystemVariantImageFromApiReducer(state = initialSlice, action) {
  switch (action.type) {
    case actionTypes.GET_SYSTEM_VARIANT_IMAGE_FROM_API: {
      // loading bayrağı tutmak istersen burada ekleyebilirsin
      return state;
    }

    case actionTypes.GET_SYSTEM_VARIANT_IMAGE_SUCCESS: {
      const { variantId, imageUrl, contentType, etag, lastModified, blob } = action.payload;
      return {
        ...state,
        [variantId]: {
          imageUrl,
          contentType,
          etag,
          lastModified,
          blob,
          error: undefined,
        },
      };
    }

    case actionTypes.GET_SYSTEM_VARIANT_IMAGE_FAILURE: {
      const { variantId, error } = action.payload;
      return {
        ...state,
        [variantId]: { ...(state[variantId] || {}), error },
      };
    }

    case actionTypes.ADD_OR_UPDATE_SYSTEM_VARIANT_IMAGE_SUCCESS: {
      // upload sonrası meta’yı güncelle (görseli tazelemek istersen akabinde GET çağır)
      const { variantId, etag, lastModified, contentType } = action.payload;
      return {
        ...state,
        [variantId]: {
          ...(state[variantId] || {}),
          etag: etag ?? state[variantId]?.etag,
          lastModified: lastModified ?? state[variantId]?.lastModified,
          contentType: contentType ?? state[variantId]?.contentType,
        },
      };
    }

    case actionTypes.DELETE_SYSTEM_VARIANT_IMAGE_SUCCESS: {
      const { variantId } = action.payload;
      const next = { ...state };
      delete next[variantId];
      return next;
    }

    case actionTypes.DELETE_SYSTEM_VARIANT_IMAGE_FAILURE: {
      const { variantId, error } = action.payload;
      return {
        ...state,
        [variantId]: { ...(state[variantId] || {}), error },
      };
    }

    default:
      return state;
  }
}
