// Path: @/redux/actions/authFetch.ts
import { LOGIN_SUCCESS, LOAD_USER_FAIL, LOGOUT } from "./actionTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Aynı anda birden fazla refresh olmasın
let refreshInFlight = null;

/** Kimlik doğrulama hatası sayılacak HTTP durumları */
function isAuthFailureStatus(status) {
  // 401: Unauthorized, 403: Forbidden (bazı backend'ler expired/invalid için kullanır),
  // 419: Authentication Timeout (bazı framework'lerde)
  return status === 401 || status === 403 || status === 419;
}

function getStoredToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

function setStoredToken(token) {
  // Token ilk neredeyse oraya yazalım (rememberMe bilgisini böyle koruruz)
  if (localStorage.getItem("token") !== null) {
    localStorage.setItem("token", token);
  } else {
    sessionStorage.setItem("token", token);
  }
}

/**
 * Refresh token ile yeni access token alır.
 * Başarılıysa LOGIN_SUCCESS (token + is_admin + role) dispatch eder ve yeni token'ı döner.
 * Başarısızsa hata fırlatır (logout akışını çağıran yer yönetir).
 */
async function doRefresh(dispatch) {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    console.log("[doRefresh] /auth/refresh çağrılıyor...");

    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { accept: "application/json" },
      credentials: "include",
      body: null,
    });

    console.log("[doRefresh] /auth/refresh yanıt status:", res.status);

    if (!res.ok) {
      console.warn("[doRefresh] refresh başarısız, ok=false");
      throw new Error(`refresh failed: ${res.status}`);
    }

    const data = await res.json().catch(() => ({}));
    console.log("[doRefresh] /auth/refresh payload:", data);

    const newToken = data.access_token || data.accessToken || data.token;
    if (!newToken) throw new Error("no access token in refresh payload");

    setStoredToken(newToken);

    dispatch?.({
      type: LOGIN_SUCCESS,
      payload: {
        token: newToken,
        is_admin: data?.is_admin ?? null,
        role: data?.role ?? null,
      },
    });

    return newToken;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}
/**
 * Yetkili fetch yardımcı fonksiyonu:
 * - Başta token yoksa: bir kez refresh dener, olmazsa LOGOUT.
 * - 401/403/419 alırsa: bir kez refresh dener, olmazsa LOGOUT.
 * - Refresh sonrası tekrar da 401/403/419 gelirse: LOGOUT.
 */
export async function fetchWithAuth(url, options = {}, dispatch) {
  // 0) Header hazırla
  const headers = new Headers(options.headers || {});
  const token = getStoredToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  // 1) Token yoksa bir kere refresh dene; olmazsa LOGOUT
  if (!token) {
    try {
      const newToken = await doRefresh(dispatch);
      const h2 = new Headers(options.headers || {});
      if (newToken) h2.set("Authorization", `Bearer ${newToken}`);

      const res2 = await fetch(url, {
        ...options,
        headers: h2,
        credentials: "include",
      });

      if (isAuthFailureStatus(res2.status)) {
        // Refresh sonrası bile yetki hatası → kesin çıkış
        try {
          dispatch?.({ type: LOAD_USER_FAIL });
          dispatch?.({ type: LOGOUT });
        } catch {}
      }
      return res2;
    } catch (e) {
      // Refresh başarısız → kesin çıkış
      try {
        dispatch?.({ type: LOAD_USER_FAIL });
        dispatch?.({ type: LOGOUT });
      } catch {}
      // Çağıran katman gerekirse status kontrolü yapacak
      return new Response(null, { status: 401, statusText: "Unauthorized" });
    }
  }

  // 2) İlk deneme: mevcut token ile
  let res = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // CORS + cookie (refresh için önemli)
  });

  // 3) Auth hatası ise → bir kez refresh dene, sonra isteği aynı paramlarla tekrar et
  if (isAuthFailureStatus(res.status)) {
    try {
      const newToken = await doRefresh(dispatch);
      const headers2 = new Headers(options.headers || {});
      if (newToken) headers2.set("Authorization", `Bearer ${newToken}`);

      res = await fetch(url, {
        ...options,
        headers: headers2,
        credentials: "include",
      });
    } catch (e) {
      // Refresh başarısız → kesin çıkış
      try {
        dispatch?.({ type: LOAD_USER_FAIL });
        dispatch?.({ type: LOGOUT });
      } catch {}
      return new Response(null, { status: 401, statusText: "Unauthorized" });
    }

    // 4) Refresh sonrası tekrar da yetki hatası ise → kesin çıkış
    if (isAuthFailureStatus(res.status)) {
      try {
        dispatch?.({ type: LOAD_USER_FAIL });
        dispatch?.({ type: LOGOUT });
      } catch {}
      return new Response(null, { status: 401, statusText: "Unauthorized" });
    }
  }

  return res;
}
