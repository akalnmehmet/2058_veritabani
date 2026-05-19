// Path: @/redux/actions/authActions.ts
// Path Alias: src/redux/actions/authActions.js
// src/redux/actions/authActions.js
import axios from 'axios'
import {
  LOGOUT,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOAD_USER,
  LOAD_USER_FAIL
} from './actionTypes'
import { toastSuccess, toastError } from "../../lib/toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
})

function setAccessToken(token, rememberMe = false) {
  if (rememberMe) {
    sessionStorage.setItem('token', token)
  } else {
    sessionStorage.setItem('token', token)
  }
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

function getAccessTokenFromStorage() {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || null
}

function getErrorMessage(err, fallback = 'İşlem başarısız.') {
  const data = err?.response?.data
  return (
    data?.message || data?.detail || data?.error || err?.message || fallback
  )
}

export const logoutUser = () => dispatch => {
  localStorage.removeItem('token')
  sessionStorage.removeItem('token')
  dispatch({ type: LOGOUT })
  delete api.defaults.headers.common['Authorization']
  toastSuccess('Çıkış yapıldı')
  window.location.href = '/login'
}

let refreshPromise = null;

export const refreshAccessToken = () => (dispatch) => {
  if (refreshPromise) {
    console.log('[refreshAccessToken] mevcut refreshPromise dönüyor...');
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      console.log('[refreshAccessToken] /auth/refresh çağrılıyor (axios)...');
      const { data } = await api.post(
        '/auth/refresh',
        null,
        { headers: { accept: 'application/json' } }
      );

      console.log('[refreshAccessToken] /auth/refresh status: 200, data:', data);

      const newToken = data?.access_token;
      if (!newToken) throw new Error('access_token yok');

      const rememberMe = !!localStorage.getItem('token');
      setAccessToken(newToken, rememberMe);

      dispatch({
        type: LOGIN_SUCCESS,
        payload: {
          token: newToken,
          is_admin: data?.is_admin ?? null,
          role: data?.role ?? null,
        },
      });

      return newToken;
    } catch (err) {
      console.error('[refreshAccessToken] refresh hata:', err?.response || err);

      dispatch({ type: LOAD_USER_FAIL });
      dispatch({ type: LOGOUT });

      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const loginUser = (username, password, rememberMe = false) => async dispatch => {
  dispatch({ type: LOGIN_REQUEST })
  try {
    const params = new URLSearchParams()
    params.append('grant_type',    'password')
    params.append('username',      username)
    params.append('password',      password)
    params.append('scope',         '')
    params.append('client_id',     import.meta.env.REACT_APP_CLIENT_ID)
    params.append('client_secret', import.meta.env.REACT_APP_CLIENT_SECRET)

    const { data } = await api.post(
      '/auth/token',
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )

    const token = data.access_token
    setAccessToken(token, rememberMe)

    dispatch({
      type: LOGIN_SUCCESS,
      payload: {
        token,
        is_admin: data?.is_admin ?? null,
        role: data?.role ?? null,
      }
    })

    await dispatch(loadCurrentUser())
  } catch (err) {
    const msg = err?.response?.status === 401
      ? 'Kullanıcı adı veya şifre hatalı'
      : getErrorMessage(err, 'Sunucu hatası')

    dispatch({
      type: LOGIN_FAILURE,
      payload: msg
    })
  }
}

export const loadCurrentUser = () => async dispatch => {
  let token = getAccessTokenFromStorage()
  if (!token) {
    try {
      token = await dispatch(refreshAccessToken())
    } catch {
      dispatch({ type: LOAD_USER_FAIL })
      return
    }
  }

  try {
    const { data } = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    dispatch({ type: LOAD_USER, payload: data })

    const meHasIsAdmin = Object.prototype.hasOwnProperty.call(data || {}, 'is_admin')
    if (!meHasIsAdmin) {
      try {
        await dispatch(refreshAccessToken())
      } catch {
        // sessiz
      }
    }
  } catch (err) {
    if (err?.response?.status === 401) {
      try {
        const newToken = await dispatch(refreshAccessToken())
        const { data } = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${newToken}` }
        })
        dispatch({ type: LOAD_USER, payload: data })
        return
      } catch {
        dispatch({ type: LOAD_USER_FAIL })
        dispatch({ type: LOGOUT })
        return
      }
    }
    dispatch({ type: LOAD_USER_FAIL })
    dispatch({ type: LOGOUT })
  }
}

export const initAuth = () => async (dispatch) => {
  try {
    const stored = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (stored) {
      api.defaults.headers.common['Authorization'] = `Bearer ${stored}`;
    }
  } catch {}

  try {
    await dispatch(loadCurrentUser());
  } catch {}
};

export const forgotPassword = (email) => async (dispatch) => {
  try {
    const { data } = await api.post(
      '/auth/forgot-password',
      { email },
      {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    toastSuccess(data?.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.')
    return data;
  } catch (err) {
    const msg = getErrorMessage(err, 'Şifre sıfırlama talebi başarısız.')
    toastError(msg)
    console.error('Forgot password error:', err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

export const changePassword = (old_password, new_password) => async (dispatch) => {
  try {
    const { data } = await api.post(
      '/auth/change-password',
      { old_password, new_password },
      {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    toastSuccess('Şifreniz başarıyla değiştirildi.')
    return data;
  } catch (err) {
    const msg = getErrorMessage(err, 'Şifre değiştirme başarısız.')
    toastError(msg)
    console.error('Reset password error:', err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

export const resetPassword = (token, password) => async (dispatch) => {
  try {
    const { data } = await api.post(
      '/auth/reset-password',
      { token, password },
      {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    toastSuccess('Şifreniz sıfırlandı. Giriş yapabilirsiniz.')
    return data;
  } catch (err) {
    const msg = getErrorMessage(err, 'Şifre sıfırlama başarısız.')
    toastError(msg)
    console.error('Reset password with token error:', err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// ✅ NEW: change username (R4.1 + R4.2)
export const changeUsername = (new_username) => async (dispatch) => {
  try {
    const { data } = await api.post(
      "/auth/change-username",
      { new_username },
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    toastSuccess(data?.message || "Kullanıcı adı güncellendi");

    // ✅ global senkron: tek kaynak /auth/me
    await dispatch(loadCurrentUser());
    return data;
  } catch (err) {
    const msg = getErrorMessage(err, "Kullanıcı adı değiştirilemedi");
    toastError(msg);
    throw err;
  }
};
