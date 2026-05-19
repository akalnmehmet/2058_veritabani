// Path: @/redux/actions/actions_bayiler.ts
import * as actionTypes from "./actionTypes";
import { fetchWithAuth } from "./authFetch";
import { toastSuccess, toastError } from "../../lib/toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function getBayilerFromApiToReducer(payload) {
  return { type: actionTypes.GET_BAYILER_FROM_API, payload };
}

export function SetUserNamePasswordOnApi(token, username, password) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/auth/accept-invite`,
        {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ token, username, password }),
        },
        dispatch
      );

      if (!res.ok) {
        let msg = `İşlem başarısız (HTTP ${res.status})`;
        try {
          const data = await res.json();
          if (data?.message) msg = data.message;
          if (data?.detail) msg = data.detail;
        } catch {}
        toastError();
        throw new Error(msg);
      }
      toastSuccess();
      return res.json();
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

// 1) Listele (GET - toast yok)
export const getDealersFromApi = (q = "search", limit = 5, page = 1) => {
  return async (dispatch) => {
    const url = `${API_BASE_URL}/dealers/?q=${encodeURIComponent(q)}&limit=${limit}&page=${page}`;
    const res = await fetchWithAuth(
      url,
      { method: "GET", headers: { Accept: "application/json" } },
      dispatch
    );

    if (!res.ok) {
      let detail;
      try { detail = await res.json(); } catch { detail = await res.text(); }
      throw new Error(`Bayi listesi alınamadı (${res.status}): ${JSON.stringify(detail)}`);
    }

    const data = await res.json();
    dispatch(getBayilerFromApiToReducer(data));
    return data;
  };
};

// 2) Düzenle (PUT)
export const editDealerOnApi = (id, payload) => {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/dealers/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(payload || {}),
        },
        dispatch
      );

      if (!res.ok) {
        let detail; try { detail = await res.json(); } catch { detail = await res.text(); }
        toastError();
        throw new Error(`Bayi güncellenemedi (${res.status}): ${JSON.stringify(detail)}`);
      }
      toastSuccess();
      return res.json();
    } catch (err) {
      toastError();
      throw err;
    }
  };
};

// 3) Sil (DELETE)
export const sellDealerOnApi = (id) => {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/dealers/${encodeURIComponent(id)}`,
        { method: "DELETE", headers: { Accept: "*/*" } },
        dispatch
      );

      if (!res.ok) {
        let detail; try { detail = await res.json(); } catch { detail = await res.text(); }
        toastError();
        throw new Error(`Bayi silinemedi (${res.status}): ${JSON.stringify(detail)}`);
      }
      toastSuccess();
      try { return await res.json(); } catch { return true; }
    } catch (err) {
      toastError();
      throw err;
    }
  };
};

// 4) Davet et (POST)
export const addDealerOnApi = (payload) => {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/dealers/invite`,
        {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(payload || {}),
        },
        dispatch
      );

      if (!res.ok) {
        let detail; try { detail = await res.json(); } catch { detail = await res.text(); }
        toastError();
        throw new Error(`Bayi daveti gönderilemedi (${res.status}): ${JSON.stringify(detail)}`);
      }
      toastSuccess();
      return res.json();
    } catch (err) {
      toastError();
      throw err;
    }
  };
};

// 5) Askıya al (POST)
export const suspendDealerOnApi = (id) => {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/dealers/${encodeURIComponent(id)}/suspend`,
        { method: "POST", headers: { Accept: "application/json" } },
        dispatch
      );

      if (!res.ok) {
        let detail; try { detail = await res.json(); } catch { detail = await res.text(); }
        toastError();
        throw new Error(`Bayi askıya alınamadı (${res.status}): ${JSON.stringify(detail)}`);
      }
      toastSuccess();
      return res.json().catch(() => true);
    } catch (err) {
      toastError();
      throw err;
    }
  };
};

// 6) Daveti yeniden gönder (POST)
export const reSendInviteOnApi = (id) => {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/dealers/${encodeURIComponent(id)}/resend-invite`,
        { method: "POST", headers: { Accept: "application/json" } },
        dispatch
      );

      if (!res.ok) {
        let detail; try { detail = await res.json(); } catch { detail = await res.text(); }
        toastError();
        throw new Error(`Davet yeniden gönderilemedi (${res.status}): ${JSON.stringify(detail)}`);
      }
      toastSuccess();
      return res.json().catch(() => true);
    } catch (err) {
      toastError();
      throw err;
    }
  };
};

// 7) Aktif et (POST)
export const activateDealerOnApi = (id) => {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/dealers/${encodeURIComponent(id)}/activate`,
        { method: "POST", headers: { Accept: "application/json" } },
        dispatch
      );

      if (!res.ok) {
        let detail; try { detail = await res.json(); } catch { detail = await res.text(); }
        toastError();
        throw new Error(`Bayi aktifleştirilemedi (${res.status}): ${JSON.stringify(detail)}`);
      }
      toastSuccess();
      return res.json().catch(() => true);
    } catch (err) {
      toastError();
      throw err;
    }
  };
};

// 8) Yeniden aktifleştir (POST)
export const reActivateDealerOnApi = ({ id, email, sendInvite = true }) => {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/dealers/reactivate?send_invite=${sendInvite ? "true" : "false"}`,
        {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ id, email }),
        },
        dispatch
      );

      if (!res.ok) {
        let detail; try { detail = await res.json(); } catch { detail = await res.text(); }
        toastError();
        throw new Error(`Bayi yeniden aktifleştirilemedi (${res.status}): ${JSON.stringify(detail)}`);
      }
      toastSuccess();
      return res.json();
    } catch (err) {
      toastError();
      throw err;
    }
  };
};

// 9) Davet linki oluştur / getir (POST)  ✅ send_email_flag
export const getDealerInviteLinkOnApi = (id, sendEmail = true) => {
  return async (dispatch) => {
    try {
      const flag = sendEmail ? "true" : "false";

      // ✅ backend iki farklı isim kullanıyorsa diye ikisini de gönderiyoruz
      const url = `${API_BASE_URL}/dealers/${encodeURIComponent(id)}/invite-link?send_email_flag=${flag}&send_email=${flag}`;

      const res = await fetchWithAuth(
        url,
        {
          method: "POST",
          headers: { Accept: "application/json" },
        },
        dispatch
      );

      if (!res.ok) {
        let detail;
        try { detail = await res.json(); } catch { detail = await res.text(); }
        toastError();
        throw new Error(`Davet linki oluşturulamadı (${res.status}): ${JSON.stringify(detail)}`);
      }

      toastSuccess(sendEmail ? "Davet e-postası gönderildi" : "Davet bağlantısı oluşturuldu");
      return res.json();
    } catch (err) {
      toastError();
      throw err;
    }
  };
};

// ✅ NEW: Bayi admin setup (R3.2)
export const adminSetupDealerOnApi = (id, payload) => {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/dealers/${encodeURIComponent(id)}/admin-setup`,
        {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(payload || {}),
        },
        dispatch
      );

      if (!res.ok) {
        let detail;
        try { detail = await res.json(); } catch { detail = await res.text(); }
        toastError();
        throw new Error(`Admin setup başarısız (${res.status}): ${JSON.stringify(detail)}`);
      }

      toastSuccess("Bayi kullanıcı bilgileri oluşturuldu");
      return res.json();
    } catch (err) {
      toastError();
      throw err;
    }
  };
};
