// Path: @/redux/actions/actions_boyalar.ts
import * as actionTypes from "./actionTypes";
import { fetchWithAuth } from "./authFetch";
import { toastSuccess, toastError } from "../../lib/toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function getProfileColorFromApiToReducer(payload) {
  return { type: actionTypes.GET_PROFILE_BOYALAR_FROM_API, payload };
}
export function getGlassColorFromApiToReducer(payload) {
  return { type: actionTypes.GET_GLASS_BOYALAR_FROM_API, payload };
}

export function addColorToApi(colorObj) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/colors/`,
        {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(colorObj),
        },
        dispatch
      );

      if (!res.ok) {
        toastError(); // İşlem başarısız
        const text = await res.text().catch(() => "");
        throw new Error(`Renk ekleme başarısız: ${res.status} ${text}`);
      }

      const data = await res.json();
      toastSuccess(); // İşlem başarılı
      return data;
    } catch (err) {
      // fetchWithAuth atarsa veya parse aşamasında hata olursa
      toastError(); // İşlem başarısız
      throw err;
    }
  };
}

export function editColorInApi(colorObj) {
  return async (dispatch) => {
    try {
      const { id, name, unit_cost } = colorObj;
      const res = await fetchWithAuth(
        `${API_BASE_URL}/colors/${id}`,
        {
          method: "PUT",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ name, unit_cost }),
        },
        dispatch
      );

      if (!res.ok) {
        toastError(); // İşlem başarısız
        const text = await res.text().catch(() => "");
        throw new Error(`Renk güncelleme başarısız: ${res.status} ${text}`);
      }

      const data = await res.json();
      toastSuccess(); // İşlem başarılı
      return data;
    } catch (err) {
      toastError(); // İşlem başarısız
      throw err;
    }
  };
}

export function deleteColorFromApi(id) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/colors/${id}/deactivate`,
        { method: "PUT", headers: { Accept: "*/*" } },
        dispatch
      );

      if (!res.ok) {
        toastError(); // İşlem başarısız
        const text = await res.text().catch(() => "");
        throw new Error(`Renk silme başarısız: ${res.status} ${text}`);
      }

      toastSuccess(); // İşlem başarılı
      return true;
    } catch (err) {
      toastError(); // İşlem başarısız
      throw err;
    }
  };
}

export function getProfileColorFromApi(page = 1, q = "", limit = 5) {
  return async (dispatch) => {
    const params = new URLSearchParams({ type: "profile", limit: String(limit), page: String(page) });
    if (q) params.append("q", q);

    const res = await fetchWithAuth(
      `${API_BASE_URL}/colors/?${params.toString()}`,
      { method: "GET", headers: { Accept: "application/json" } },
      dispatch
    );
    if (!res.ok) throw new Error(`Profil renkleri alınamadı: ${res.status}`);
    const data = await res.json();
    dispatch(getProfileColorFromApiToReducer(data));
    return data;
  };
}

export function getGlassColorFromApi(page = 1, q = "", limit = 5) {
  return async (dispatch) => {
    const params = new URLSearchParams({ type: "glass", limit: String(limit), page: String(page) });
    if (q) params.append("q", q);

    const res = await fetchWithAuth(
      `${API_BASE_URL}/colors/?${params.toString()}`,
      { method: "GET", headers: { Accept: "application/json" } },
      dispatch
    );
    if (!res.ok) throw new Error(`Cam renkleri alınamadı: ${res.status}`);
    const data = await res.json();
    dispatch(getGlassColorFromApiToReducer(data));
    return data;
  };
}

// === Varsayılan CAM rengi (1) ATAMA ===
export function makeDefaultColorOne(colorId) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/colors/glass-default/${colorId}`,
        {
          method: "PUT",
          headers: { accept: "application/json" },
        },
        dispatch
      );

      if (!res.ok) {
        toastError();
        const text = await res.text().catch(() => "");
        throw new Error(`Varsayılan cam rengi-1 atanamadı: ${res.status} ${text}`);
      }

      const data = await res.json().catch(() => ({}));
      toastSuccess();
      return data;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

// === Varsayılan CAM rengi (1) GETİRME ===
export function getDefaultColorOne() {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/colors/glass-default`,
        {
          method: "GET",
          headers: { accept: "application/json" },
        },
        dispatch
      );

      if (!res.ok) {
        // Bazı API'lar 404 dönebilir; mesajı geliştirici için anlaşılır verelim
        const text = await res.text().catch(() => "");
        throw new Error(`Varsayılan cam rengi-1 alınamadı: ${res.status} ${text}`);
      }

      const data = await res.json();
      return data; // İstersen burada bir reducera da dispatch edebilirsin
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

// === Varsayılan CAM rengi (2) ATAMA ===
export function makeDefaultColorTwo(colorId) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/colors/glass-default2/${colorId}`,
        {
          method: "PUT",
          headers: { accept: "application/json" },
        },
        dispatch
      );

      if (!res.ok) {
        toastError();
        const text = await res.text().catch(() => "");
        throw new Error(`Varsayılan cam rengi-2 atanamadı: ${res.status} ${text}`);
      }

      const data = await res.json().catch(() => ({}));
      toastSuccess();
      return data;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

// === Varsayılan CAM rengi (2) GETİRME ===
export function getDefaultColorTwo() {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/colors/glass-default2`,
        {
          method: "GET",
          headers: { accept: "application/json" },
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Varsayılan cam rengi-2 alınamadı: ${res.status} ${text}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}
