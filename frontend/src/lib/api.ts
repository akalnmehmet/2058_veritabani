// Path: @/lib/api.ts
import axios from "axios";

// .env'de VITE_API_BASE_URL = https://example.com/api gibi bir değer olmalı
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // auth cookie vs kullanıyorsan
  headers: {
    "Content-Type": "application/json",
  },
});

// (İsteğe bağlı) genel hata/yenileme interceptorları eklenebilir
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // burada merkezi hata ele alabilirsin
    return Promise.reject(err);
  }
);

export default api;
