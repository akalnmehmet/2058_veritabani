// Path: @/redux/reducers/authReducer.ts
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOAD_USER,
  LOAD_USER_FAIL,
  LOGOUT,
} from "@/redux/actions/actionTypes";

/**
 * deriveIsAdmin(is_admin, role, user)
 *
 * Tek bir yerden, her zaman boolean bir isAdmin üretmek için yardımcı fonksiyon.
 *
 * Öncelik:
 * 1) Eğer is_admin boolean ise onu kullan.
 * 2) Değilse user?.is_admin boolean ise onu kullan.
 * 3) Hâlâ yoksa role === 'admin' mi ona bak.
 * 4) Hiçbiri yoksa false döner (admin değil gibi davranırız).
 *
 * NOT:
 *  - /auth/refresh çağrısını burada yapmıyoruz; reducer saf (pure) kalmalı.
 *  - Senin istediğin "hiçbiri yoksa /auth/refresh ile admin mi bak" adımını
 *    zaten loadCurrentUser + refreshAccessToken tarafında yapıyoruz:
 *    /auth/me is_admin/role dönmezse tek atımlık refresh çalışıyor ve
 *    oradaki LOGIN_SUCCESS → bu helper ile isAdmin'i dolduruyor.
 */
function deriveIsAdmin(rawIsAdmin, role, user) {
  // 1) Eğer doğrudan boolean geldiyse (true/false) onu kullan
  if (typeof rawIsAdmin === "boolean") {
    return rawIsAdmin;
  }

  // 2) Kullanıcı objesi içinde is_admin varsa onu kullan
  const userIsAdmin = user?.is_admin;
  if (typeof userIsAdmin === "boolean") {
    return userIsAdmin;
  }

  // 3) Sadece role geldiyse (ör: "admin") buradan türet
  if (typeof role === "string") {
    return role === "admin";
  }

  // 4) Hiçbir veri yok → güvenli default: admin değil
  return false;
}

const initialState = {
  token:
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    null,
  loading: false,
  user: null,
  error: null,

  // Backend'ten ham gelen alanlar:
  is_admin: null,
  role: null,

  // Uygulama içinde HER ZAMAN boolean kullanacağımız normalize alan:
  // true  → admin
  // false → admin değil
  isAdmin: null,

  // Auth başlangıç senaryosu yüklendi mi (initAuth / loadCurrentUser bitti mi)
  bootstrapped: false,
};

export default function auth(state = initialState, action) {
  switch (action.type) {
    case LOGIN_REQUEST: {
      return { ...state, loading: true, error: null };
    }

    case LOGIN_SUCCESS: {
      // payload string (token) ya da { token, is_admin, role } olabilir
      const isObj =
        action && typeof action.payload === "object" && action.payload !== null;

      const nextToken = isObj
        ? action.payload.token
        : action.payload;

      // Ham is_admin / role alanlarını güncelle
      const nextIsAdminRaw =
        isObj && "is_admin" in action.payload
          ? action.payload.is_admin
          : state.is_admin;

      const nextRole =
        isObj && "role" in action.payload
          ? action.payload.role
          : state.role;

      // Kullanıcı objesi şu aşamada genelde null; yine de state.user'ı geçiyoruz
      const nextUser = state.user;

      // Tüm verilerden tek bir normalize boolean üret
      const normalizedIsAdmin = deriveIsAdmin(
        nextIsAdminRaw,
        nextRole,
        nextUser
      );

      return {
        ...state,
        loading: false,
        token: nextToken,
        is_admin: nextIsAdminRaw,
        role: nextRole,
        isAdmin: normalizedIsAdmin,
        bootstrapped: true,
      };
    }

    case LOGIN_FAILURE: {
      return { ...state, loading: false, error: action.payload };
    }

    case LOAD_USER: {
      const nextUser = action.payload;

      // /auth/me yanıtında is_admin/role varsa state’e yaz, yoksa eskisini koru
      const nextIsAdminRaw =
        nextUser?.is_admin ?? state.is_admin;
      const nextRole =
        nextUser?.role ?? state.role;

      // Kullanıcı + ham alanlardan normalize isAdmin üret
      const normalizedIsAdmin = deriveIsAdmin(
        nextIsAdminRaw,
        nextRole,
        nextUser
      );

      return {
        ...state,
        user: nextUser,
        is_admin: nextIsAdminRaw,
        role: nextRole,
        isAdmin: normalizedIsAdmin,
      };
    }

    case LOAD_USER_FAIL: {
      // Kullanıcı tamamen düştü → admin değildir varsayıyoruz
      return {
        ...state,
        user: null,
        is_admin: null,
        role: null,
        isAdmin: false,
        bootstrapped: true,
      };
    }

    case LOGOUT: {
      // Tüm auth state'i sıfırla ama bootstrapped = true kalsın (uygulama login'e gider)
      return {
        ...initialState,
        bootstrapped: true,
        isAdmin: false, // logout sonrası kesinlikle admin değil
      };
    }

    default:
      return state;
  }
}
