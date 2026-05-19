// Path: @/redux/reducers/calcHelpersReducer.ts
import {
  GET_CALC_HELPERS_REQUEST,
  GET_CALC_HELPERS_SUCCESS,
  GET_CALC_HELPERS_FAILURE,
  PUT_CALC_HELPERS_REQUEST,
  PUT_CALC_HELPERS_SUCCESS,
  PUT_CALC_HELPERS_FAILURE,
} from "@/redux/actions/actionTypes";

const initialState = {
  loading: false,
  saving: false,
  error: null,
  data: null, // { bicak_payi, boya_payi, is_default, has_record }
};

export default function calcHelpersReducer(state = initialState, action) {
  switch (action.type) {
    case GET_CALC_HELPERS_REQUEST:
      return { ...state, loading: true, error: null };

    case GET_CALC_HELPERS_SUCCESS:
      return { ...state, loading: false, data: action.payload, error: null };

    case GET_CALC_HELPERS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case PUT_CALC_HELPERS_REQUEST:
      return { ...state, saving: true, error: null };

    case PUT_CALC_HELPERS_SUCCESS:
      return { ...state, saving: false, data: action.payload, error: null };

    case PUT_CALC_HELPERS_FAILURE:
      return { ...state, saving: false, error: action.payload };

    default:
      return state;
  }
}
