// Path: @/redux/actions/actions_profilfoto.ts
// actions_profilfoto.js
import { fetchWithAuth } from "./authFetch";
import { toastSuccess, toastError } from "../../lib/toast";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


/**
 * 1) GET /api/me/profile-picture
 * - Sunucu JSON dönebilir (ör: { url: "..." }) veya doğrudan image binary dönebilir.
 * - Her iki senaryoyu da destekler: JSON ise JSON’u; image ise { blob, url } döner.
 */

export async function getProfilePicture({ cacheBust = false } = {}) {
  const url = `${API_BASE_URL}/me/profile-picture${cacheBust ? `?_=${Date.now()}` : ""}`;

  try {
    const res = await fetchWithAuth(
      url,
      {
        method: "GET",
        headers: { accept: "image/jpeg" }, // ÖNEMLİ: JSON değil, görsel bekliyoruz
      },
      undefined // dispatch gerekmiyorsa undefined kalabilir
    );

    if (!res.ok) {
      const text = await safeText(res);
      throw new Error(`Profil foto alınamadı: ${res.status} ${text}`);
    }

    // JPEG baytlarını oku
    const buf = await res.arrayBuffer();

    // İstersen BURADA blob/objectURL da üretebilirsin:
    // const blob = new Blob([buf], { type: "image/jpeg" });
    // const objectUrl = URL.createObjectURL(blob);

    // base64'e çevir → data URL üret (brand mantığıyla bire bir aynı)
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    return dataUrl; // <img src={dataUrl}> olarak direkt kullanılır
  } catch (err) {
    console.error("getProfilePicture error:", err);
    throw err;
  }
}
/**
 * İç yardımcı: fetch error body güvenli okuma
 */
async function safeText(res) {
  try {
    const t = await res.text();
    return t;
  } catch {
    return "";
  }
}

/**
 * 2) PUT /api/me/profile-picture  (var olanı güncelle)
 * @param {File|Blob} file - input[type=file] ile seçilen dosya
 * @param {string} filename - opsiyonel; Blob için isim atamak isterseniz
 */
export async function updateProfilePicture(file, filename = "profile.jpg") {
  try {
    if (!file) throw new Error("Dosya gerekli.");

    const form = new FormData();
    // FastAPI tarafında alan adı "file" olarak bekleniyor
    form.append("file", file, file.name || filename);

    const res = await fetchWithAuth(
      `${API_BASE_URL}/me/profile-picture`,
      {
        method: "PUT",
        // DİKKAT: Content-Type'ı elle vermiyoruz; boundary’yi fetch ayarlar
        headers: { Accept: "application/json" },
        body: form,
      }
    );

    if (!res.ok) {
      const errText = await safeText(res);
      throw new Error(errText || `PUT failed (${res.status})`);
    }

    const ct = (res.headers.get("content-type") || "").toLowerCase();
    let data = ct.includes("application/json") ? await res.json() : await res.text();
    toastSuccess("Profil fotoğrafı güncellendi.");
    return data;
  } catch (err) {
    console.error("updateProfilePicture error:", err);
    toastError("Profil fotoğrafı güncellenemedi.");
    throw err;
  }
}

/**
 * 3) POST /api/me/profile-picture  (yeni ekle)
 * @param {File|Blob} file
 * @param {string} filename
 */
export async function uploadProfilePicture(file, filename = "profile.jpg") {
  try {
    if (!file) throw new Error("Dosya gerekli.");

    const form = new FormData();
    form.append("file", file, file.name || filename);

    const res = await fetchWithAuth(
      `${API_BASE_URL}/me/profile-picture`,
      {
        method: "POST",
        headers: { Accept: "application/json" },
        body: form,
      }
    );

    if (!res.ok) {
      const errText = await safeText(res);
      throw new Error(errText || `POST failed (${res.status})`);
    }

    const ct = (res.headers.get("content-type") || "").toLowerCase();
    let data = ct.includes("application/json") ? await res.json() : await res.text();

    toastSuccess("Profil fotoğrafı yüklendi.");
    return data;
  } catch (err) {
    console.error("uploadProfilePicture error:", err);
    toastError("Profil fotoğrafı yüklenemedi.");
    throw err;
  }
}

/**
 * 4) DELETE /api/me/profile-picture
 */
export async function deleteProfilePicture() {
  try {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/me/profile-picture`,
      {
        method: "DELETE",
        headers: { Accept: "*/*" },
      }
    );

    if (!res.ok) {
      const errText = await safeText(res);
      throw new Error(errText || `DELETE failed (${res.status})`);
    }

    // Bazı API'ler 204 gönderir; bazıları JSON döner:
    let out = null;
    try {
      const ct = (res.headers.get("content-type") || "").toLowerCase();
      out = ct.includes("application/json") ? await res.json() : await res.text();
    } catch {
      // no body
    }

    toastSuccess("Profil fotoğrafı silindi.");
    return out;
  } catch (err) {
    console.error("deleteProfilePicture error:", err);
    toastError("Profil fotoğrafı silinemedi.");
    throw err;
  }
}
