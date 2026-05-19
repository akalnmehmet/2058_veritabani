// Path: @/redux/reducers/getSystemImageFromApiReducer.ts
import * as actionTypes from "../actions/actionTypes";
import initialState from "./initialState";

export default function getSystemImageFromApiReducer(
  state = initialState.systemImage || {},
  action
) {
  switch (action.type) {
    case actionTypes.GET_SYSTEM_IMAGE_FROM_API: {
      return state; // istersen loading bayrağı ekleyebilirsin
    }
    case actionTypes.GET_SYSTEM_IMAGE_SUCCESS: {
      const { systemId, imageUrl, contentType, etag, lastModified, blob } = action.payload;
      return {
        ...state,
        [systemId]: { imageUrl, contentType, etag, lastModified, blob, error: undefined },
      };
    }
    case actionTypes.GET_SYSTEM_IMAGE_FAILURE: {
      const { systemId, error } = action.payload;
      return { ...state, [systemId]: { ...(state[systemId] || {}), error } };
    }
    case actionTypes.ADD_OR_UPDATE_SYSTEM_IMAGE_SUCCESS: {
      const { systemId, etag, lastModified, contentType } = action.payload;
      return {
        ...state,
        [systemId]: {
          ...(state[systemId] || {}),
          etag: etag ?? state[systemId]?.etag,
          lastModified: lastModified ?? state[systemId]?.lastModified,
          contentType: contentType ?? state[systemId]?.contentType,
        },
      };
    }
    case actionTypes.DELETE_SYSTEM_IMAGE_SUCCESS: {
      const { systemId } = action.payload;
      const next = { ...state };
      delete next[systemId];
      return next;
    }
    case actionTypes.DELETE_SYSTEM_IMAGE_FAILURE: {
      const { systemId, error } = action.payload;
      return { ...state, [systemId]: { ...(state[systemId] || {}), error } };
    }
    default:
      return state;
  }
}
