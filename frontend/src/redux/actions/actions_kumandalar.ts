// Path: @/redux/actions/actions_kumandalar.ts
import * as actionTypes from "./actionTypes";
import { fetchWithAuth } from "./authFetch";
import { toastSuccess, toastError } from "../../lib/toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function getKumandalarFromApiToReducer(payload) {
  return { type: actionTypes.GET_KUMANDALAR_FROM_API, payload };
}

// GET — toast yok
export function getKumandalarFromApi({ q = "selam", limit = 5, page = 1 } = {}) {
  return async (dispatch) => {
    const url = `${API_BASE_URL}/catalog/remotes?q=${encodeURIComponent(q)}&limit=${limit}&page=${page}`;
    const res = await fetchWithAuth(
      url,
      { method: "GET", headers: { Accept: "application/json" } },
      dispatch
    );
    if (!res.ok) {
      const errTxt = await res.text().catch(() => "");
      throw new Error(`Kumandalar getirilemedi (HTTP ${res.status}). ${errTxt}`);
    }
    const data = await res.json();
    dispatch(getKumandalarFromApiToReducer(data));
    return data;
  };
}

// POST
export function addKumandaToApi({ kumanda_isim, price, kapasite }) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/catalog/remotes`,
        {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ kumanda_isim, price, kapasite }),
        },
        dispatch
      );
      if (!res.ok) {
        const errTxt = await res.text().catch(() => "");
        toastError();
        throw new Error(`Kumanda eklenemedi (HTTP ${res.status}). ${errTxt}`);
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
export function deleteKumandaOnApi(id) {
  return async (dispatch) => {
    try {
      if (!id) throw new Error("Silmek için 'id' gerekli.");
      const res = await fetchWithAuth(
        `${API_BASE_URL}/catalog/remotes/${encodeURIComponent(id)}/deactivate`,
        { method: "PUT", headers: { Accept: "*/*" } },
        dispatch
      );
      if (!res.ok) {
        const errTxt = await res.text().catch(() => "");
        toastError();
        throw new Error(`Kumanda silinemedi (HTTP ${res.status}). ${errTxt}`);
      }
      toastSuccess();
      return true;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

// PUT
export function editKumandaOnApi(id, { kumanda_isim, price, kapasite }) {
  return async (dispatch) => {
    try {
      if (!id) throw new Error("Düzenlemek için 'id' gerekli.");
      const res = await fetchWithAuth(
        `${API_BASE_URL}/catalog/remotes/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ kumanda_isim, price, kapasite }),
        },
        dispatch
      );
      if (!res.ok) {
        const errTxt = await res.text().catch(() => "");
        toastError();
        throw new Error(`Kumanda güncellenemedi (HTTP ${res.status}). ${errTxt}`);
      }
      toastSuccess();
      return res.json();
    } catch (err) {
      toastError();
      throw err;
    }
  };
}
