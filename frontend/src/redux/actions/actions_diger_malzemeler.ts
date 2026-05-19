// Path: @/redux/actions/actions_diger_malzemeler.ts
import * as actionTypes from "./actionTypes";
import { fetchWithAuth } from "./authFetch";
import { toastSuccess, toastError } from "../../lib/toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function getDigerMalzemelerFromApiToReducer(payload) {
  return { type: actionTypes.GET_DIGER_MALZEMELER_FROM_API, payload };
}

// GET — toast yok
export function getDigerMalzemelerFromApi(page = 1, q = "", limit = 5) {
  return async (dispatch) => {
    const params = new URLSearchParams({ limit: String(limit), page: String(page) });
    if (q) params.append("q", q);

    const res = await fetchWithAuth(
      `${API_BASE_URL}/catalog/other-materials?${params.toString()}`,
      { method: "GET", headers: { Accept: "application/json" } },
      dispatch
    );
    if (!res.ok) throw new Error(`Diğer malzemeler alınamadı: ${res.status}`);
    const data = await res.json();
    dispatch(getDigerMalzemelerFromApiToReducer(data));
    return data;
  };
}

// POST
export function addDigerMalzemeToApi(addedRow) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/catalog/other-materials`,
        {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(addedRow),
        },
        dispatch
      );
      if (!res.ok) {
        toastError();
        throw new Error(`Ekleme başarısız: ${res.status}`);
      }
      toastSuccess();
      return res.json();
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

// PUT
export function editDigerMalzemeOnApi(id, editedRow) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/catalog/other-materials/${id}`,
        {
          method: "PUT",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(editedRow),
        },
        dispatch
      );
      if (!res.ok) {
        toastError();
        throw new Error(`Güncelleme başarısız: ${res.status}`);
      }
      toastSuccess();
      return res.json();
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

// DELETE
export function sellDigerMalzemeOnApi(malzeme_id) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/catalog/other-materials/${malzeme_id}/deactivate`,
        { method: "PUT", headers: { Accept: "application/json" } },
        dispatch
      );
      if (!res.ok) {
        toastError();
        throw new Error(`Silme başarısız: ${res.status}`);
      }
      toastSuccess();
      return true;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}
