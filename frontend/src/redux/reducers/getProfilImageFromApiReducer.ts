// Path: @/redux/reducers/getProfilImageFromApiReducer.ts
// getProfilImageFromApiReducer.js
import * as actionTypes from "../actions/actionTypes";
import initialState from "./initialState";

export default function getProfilImageFromApiReducer(
  state = initialState.profilImage || {},  // null yerine {}
  action
) {
  switch (action.type) {
    case actionTypes.GET_PROFIL_IMAGE_FROM_API:
      return state; // (opsiyonel) loading bayrağı için ayrı state tutacaksan kullan

    case "GET_PROFIL_IMAGE_SUCCESS": {
      const { profileId, imageData } = action.payload;
      return { ...state, [profileId]: { imageData } };
    }

    case "GET_PROFIL_IMAGE_FAILURE": {
      const { profileId, error } = action.payload;
      return { ...state, [profileId]: { error } };
    }

    default:
      return state;
  }
}
