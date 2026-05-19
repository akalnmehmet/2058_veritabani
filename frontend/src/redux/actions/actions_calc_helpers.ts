// Path: @/redux/actions/actions_calc_helpers.ts
import * as actionTypes from "./actionTypes";
import { fetchWithAuth } from "./authFetch";
import { toastSuccess, toastError } from "../../lib/toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getCalculationHelpers = () => async (dispatch) => {
  dispatch({ type: actionTypes.GET_CALC_HELPERS_REQUEST });

  try {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/me/calculation-helpers`,
      { method: "GET", headers: { Accept: "application/json" } },
      dispatch
    );

    if (!res.ok) {
      let detail;
      try {
        detail = await res.json();
      } catch {
        detail = await res.text();
      }
      throw new Error(
        `calc-helpers alınamadı (${res.status}): ${JSON.stringify(detail)}`
      );
    }

    const data = await res.json();
    dispatch({ type: actionTypes.GET_CALC_HELPERS_SUCCESS, payload: data });
    return data;
  } catch (e: any) {
    dispatch({
      type: actionTypes.GET_CALC_HELPERS_FAILURE,
      payload: e?.message || String(e),
    });
    toastError(e?.message || "Hesap ayarları alınamadı");
    throw e;
  }
};

export const putCalculationHelpers = (payload) => async (dispatch) => {
  dispatch({ type: actionTypes.PUT_CALC_HELPERS_REQUEST });

  try {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/me/calculation-helpers`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload || {}),
      },
      dispatch
    );

    if (!res.ok) {
      let detail;
      try {
        detail = await res.json();
      } catch {
        detail = await res.text();
      }
      throw new Error(
        `calc-helpers kaydedilemedi (${res.status}): ${JSON.stringify(detail)}`
      );
    }

    const data = await res.json();
    dispatch({ type: actionTypes.PUT_CALC_HELPERS_SUCCESS, payload: data });
    toastSuccess("Optimizasyon parametreleri kaydedildi");

    // ✅ Kaydetme başarılıysa reducer'ı güncel tutmak için tekrar GET
    try {
      await dispatch<any>(getCalculationHelpers());
    } catch {
      // GET fail olsa bile PUT başarılıydı; sadece sessizce geçiyoruz.
    }

    return data;
  } catch (e: any) {
    dispatch({
      type: actionTypes.PUT_CALC_HELPERS_FAILURE,
      payload: e?.message || String(e),
    });
    toastError(e?.message || "Kaydetme başarısız");
    throw e;
  }
};
