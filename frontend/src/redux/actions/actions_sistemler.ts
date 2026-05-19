// Path: @/redux/actions/actions_sistemler.ts
import * as actionTypes from "./actionTypes";
import { fetchWithAuth } from "./authFetch";
import { toastSuccess, toastError } from "../../lib/toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function getSistemlerFromApiToReducer(payload) {
  return { type: actionTypes.GET_SISTEMLER_FROM_API, payload };
}
export function getSystemVariantsOfSystemFromApiToReducer(payload) {
  return { type: actionTypes.SYSTEM_VARIANTS_OF_SYSTEM, payload };
}
export function getSystemFullVariantsOfSystemFromApiToReducer(payload) {
  return { type: actionTypes.FULL_VARIANT_OF_SYSTEM, payload };
}
export function getSystemVariantsFromApiToReducer(payload) {
  return { type: actionTypes.GET_SYSTEM_VARIANTS_FROM_API, payload };
}
/**
 * System foto ekle/güncelle (multipart/form-data)
 * @param {string} systemId  - örn: "20a810d8-5612-48ed-9daa-3efea0f51cd0"
 * @param {File|Blob} file   - input[type=file] veya Blob nesnesi
 * @returns {Function}
 *
 * Notlar:
 * - Content-Type'ı elle set etme. FormData kendi boundary'sini ekler.
 * - Accept'i "application/json" bıraktım; backend JSON döndürüyorsa yakalarız.
 * - Başarı durumunda ETag/Last-Modified alınır; UI bu bilgiyi cache kontrolünde kullanabilir.
 */

export function postSystemVariantImageToApi(variantId, file) {
  return async (dispatch) => {
    dispatch({
      type: actionTypes.ADD_OR_UPDATE_SYSTEM_VARIANT_IMAGE_REQUEST,
      payload: { variantId },
    });

    try {
      const form = new FormData();
      form.append("file", file); // alan adı: 'file' (curl ile aynı)

      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-variants/${variantId}/photo`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            // DİKKAT: Content-Type set ETME! (FormData boundary’yi kendi ekler)
          },
          body: form,
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        toastError();
        throw new Error(`Variant foto yükleme başarısız (HTTP ${res.status}) ${text}`);
      }

      // bazı backend’ler boş body döner; güvenli parse
      let data = {};
      try { data = await res.json(); } catch (_) {}

      const etag         = res.headers.get("etag");
      const lastModified = res.headers.get("last-modified");
      const contentType  = res.headers.get("content-type");

      dispatch({
        type: actionTypes.ADD_OR_UPDATE_SYSTEM_VARIANT_IMAGE_SUCCESS,
        payload: { variantId, etag, lastModified, contentType, data },
      });

      toastSuccess();
      return { etag, lastModified, contentType, ...data };
    } catch (error) {
      dispatch({
        type: actionTypes.ADD_OR_UPDATE_SYSTEM_VARIANT_IMAGE_FAILURE,
        payload: { variantId, error: String(error) },
      });
      toastError();
      throw error;
    }
  };
}

/**
 * Variant foto SİL
 * curl eşleniği: DELETE /api/system-variants/:variantId/photo
 * @param {string} variantId
 */
export function deleteSystemVariantImageFromApi(variantId) {
  return async (dispatch) => {
    dispatch({
      type: actionTypes.DELETE_SYSTEM_VARIANT_IMAGE_REQUEST,
      payload: { variantId },
    });

    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-variants/${variantId}/photo`,
        { method: "DELETE", headers: { Accept: "application/json" } },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        toastError();
        throw new Error(`Variant foto silme başarısız (HTTP ${res.status}) ${text}`);
      }

      dispatch({
        type: actionTypes.DELETE_SYSTEM_VARIANT_IMAGE_SUCCESS,
        payload: { variantId },
      });

      toastSuccess();
      return true;
    } catch (error) {
      dispatch({
        type: actionTypes.DELETE_SYSTEM_VARIANT_IMAGE_FAILURE,
        payload: { variantId, error: String(error) },
      });
      toastError();
      throw error;
    }
  };
}

/**
 * Variant foto GET (Blob + ObjectURL)
 * curl eşleniği: GET /api/system-variants/:variantId/photo (image/jpeg döner)
 * @param {string} variantId
 */
export function getSystemVariantImageFromApi(variantId) {
  return async (dispatch) => {
    dispatch({
      type: actionTypes.GET_SYSTEM_VARIANT_IMAGE_FROM_API,
      payload: { variantId },
    });

    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-variants/${variantId}/photo`,
        { method: "GET", headers: { Accept: "image/*" } },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Variant foto çekme başarısız (HTTP ${res.status}) ${text}`);
      }

      const contentType  = res.headers.get("content-type") || "application/octet-stream";
      const etag         = res.headers.get("etag");
      const lastModified = res.headers.get("last-modified");

      const blob = await res.blob();
      const imageUrl = URL.createObjectURL(blob);

      dispatch({
        type: actionTypes.GET_SYSTEM_VARIANT_IMAGE_SUCCESS,
        payload: { variantId, imageUrl, contentType, etag, lastModified, blob },
      });

      return { imageUrl, contentType, etag, lastModified, blob };
    } catch (error) {
      dispatch({
        type: actionTypes.GET_SYSTEM_VARIANT_IMAGE_FAILURE,
        payload: { variantId, error: String(error) },
      });
      throw error;
    }
  };
}



export function AddOrUpdateSystemImageFromApi(systemId, file) {
  return async (dispatch) => {
    dispatch({ type: actionTypes.ADD_OR_UPDATE_SYSTEM_IMAGE_REQUEST, payload: { systemId } });

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetchWithAuth(
        `${API_BASE_URL}/systems/${systemId}/photo`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            // DİKKAT: 'Content-Type' YAZMA!
          },
          body: form,
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        toastError();
        throw new Error(`Görsel yükleme başarısız (HTTP ${res.status}) ${text}`);
      }

      let data = {};
      try { data = await res.json(); } catch (_) {}

      const etag          = res.headers.get("etag");
      const lastModified  = res.headers.get("last-modified");
      const contentType   = res.headers.get("content-type");

      dispatch({
        type: actionTypes.ADD_OR_UPDATE_SYSTEM_IMAGE_SUCCESS,
        payload: { systemId, etag, lastModified, contentType, data },
      });

      toastSuccess();
      return { etag, lastModified, contentType, ...data };
    } catch (error) {
      dispatch({
        type: actionTypes.ADD_OR_UPDATE_SYSTEM_IMAGE_FAILURE,
        payload: { systemId, error: String(error) },
      });
      toastError();
      throw error;
    }
  };
}

export function getSystemImageFromApi(systemId) {
  return async (dispatch) => {
    dispatch({ type: actionTypes.GET_SYSTEM_IMAGE_FROM_API, payload: { systemId } });

    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/systems/${systemId}/photo`,
        {
          method: "GET",
          headers: {
            // Sunucu 'image/jpeg' dönüyor; Accept'i geniş tuttum.
            Accept: "image/*",
          },
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Görsel çekme başarısız (HTTP ${res.status}) ${text}`);
      }

      const contentType  = res.headers.get("content-type") || "application/octet-stream";
      const etag         = res.headers.get("etag");
      const lastModified = res.headers.get("last-modified");

      const blob = await res.blob();
      const imageUrl = URL.createObjectURL(blob);

      dispatch({
        type: actionTypes.GET_SYSTEM_IMAGE_SUCCESS,
        payload: { systemId, imageUrl, contentType, etag, lastModified, blob },
      });

      return { imageUrl, contentType, etag, lastModified, blob };
    } catch (error) {
      dispatch({
        type: actionTypes.GET_SYSTEM_IMAGE_FAILURE,
        payload: { systemId, error: String(error) },
      });
      throw error;
    }
  };
}
export function deleteSystemImageOnApi(systemId) {
  return async (dispatch) => {
    dispatch({ type: actionTypes.DELETE_SYSTEM_IMAGE_REQUEST, payload: { systemId } });
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/systems/${systemId}/photo`,
        { method: "DELETE", headers: { Accept: "application/json" } },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        toastError();
        throw new Error(`Fotoğraf silme başarısız (HTTP ${res.status}) ${text}`);
      }

      dispatch({ type: actionTypes.DELETE_SYSTEM_IMAGE_SUCCESS, payload: { systemId } });
      toastSuccess();
      return true;
    } catch (error) {
      dispatch({
        type: actionTypes.DELETE_SYSTEM_IMAGE_FAILURE,
        payload: { systemId, error: String(error) },
      });
      toastError();
      throw error;
    }
  };
}

export function getSystemVariantsFromApi(page = 1, q = "", limit = 5) {
  return async (dispatch) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (q) params.append("q", q);

    const res = await fetchWithAuth(
      `${API_BASE_URL}/system-variants/?${params.toString()}`,
      { method: "GET", headers: { Accept: "application/json" } },
      dispatch
    );
    if (!res.ok) throw new Error(`Network not ok (${res.status})`);
    const data = await res.json();
    dispatch(getSystemVariantsFromApiToReducer(data));
    return data;
  };
}

export function getSistemlerFromApi(page = 1, q = "", limit = 5) {
  return async (dispatch) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (q) params.append("q", q);

    const res = await fetchWithAuth(
      `${API_BASE_URL}/systems?${params.toString()}`,
      { method: "GET", headers: { Accept: "application/json" } },
      dispatch
    );
    if (!res.ok) throw new Error(`Network not ok (${res.status})`);
    const data = await res.json();
    dispatch(getSistemlerFromApiToReducer(data));
    return data;
  };
}

export function getSystemVariantsOfSystemFromApi(systemId, page = 1, q = "", limit = "all") {
  return async (dispatch) => {
    const params = new URLSearchParams();
    if (q !== "") params.set("q", q);
    params.set("limit", String(limit));
    params.set("page", String(page));

    const res = await fetchWithAuth(
      `${API_BASE_URL}/system-variants/system/${systemId}?${params.toString()}`,
      { method: "GET", headers: { Accept: "application/json" } },
      dispatch
    );

    if (!res.ok) throw new Error(`Network not ok (${res.status})`);
    const data = await res.json();
    dispatch(getSystemVariantsOfSystemFromApiToReducer(data));
    return data;
  };
}

export function getSystemFullVariantsOfSystemFromApi(variantId) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/system-variants/${variantId}`,
      { method: "GET", headers: { Accept: "application/json" } },
      dispatch
    );
    if (!res.ok) throw new Error(`Network not ok (${res.status})`);
    const data = await res.json();
    dispatch(getSystemFullVariantsOfSystemFromApiToReducer(data));
    return data;
  };
}

// --- SYSTEM CRUD ---
export function addSystemToApi(system) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/systems`,
        {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(system),
        },
        dispatch
      );
      if (!res.ok) {
        toastError();
        throw new Error(`Sistem ekleme başarısız: ${res.status}`);
      }
      toastSuccess();
      return res.json();
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

export function editSystemOnApi(systemId, updated) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/systems/${systemId}`,
        {
          method: "PUT",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        },
        dispatch
      );
      if (!res.ok) {
        toastError();
        throw new Error(`Sistem güncelleme başarısız: ${res.status}`);
      }
      toastSuccess();
      return res.json();
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

export function deleteSystemOnApi(systemId) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/systems/${systemId}`,
        { method: "DELETE", headers: { Accept: "*/*" } },
        dispatch
      );
      if (!res.ok) {
        toastError();
        throw new Error(`Sistem silme başarısız: ${res.status}`);
      }
      toastSuccess();
      return true;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

// --- SYSTEM VARIANT CRUD ---
export function addSystemVariantToApi(variant) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-variants/`,
        {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(variant),
        },
        dispatch
      );
      if (!res.ok) {
        toastError();
        throw new Error(`Varyant ekleme başarısız: ${res.status}`);
      }
      toastSuccess();
      return res.json();
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

export function editSystemVariantOnApi(variantId, updated) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-variants/${variantId}`,
        {
          method: "PUT",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        },
        dispatch
      );
      if (!res.ok) {
        toastError();
        throw new Error(`Varyant güncelleme başarısız: ${res.status}`);
      }
      toastSuccess();
      return res.json();
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

export function editSystemVariantTemplatesOnApi(variantId, updated) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-variants/${variantId}/templates`,
        {
          method: "PUT",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        },
        dispatch
      );
      if (!res.ok) {
        toastError();
        throw new Error(`Varyant güncelleme başarısız: ${res.status}`);
      }
      toastSuccess();
      return res.json();
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

export function deleteSystemVariantOnApi(variantId) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-variants/${variantId}`,
        { method: "DELETE", headers: { Accept: "*/*" } },
        dispatch
      );
      if (!res.ok) {
        toastError();
        throw new Error(`Varyant silme başarısız: ${res.status}`);
      }
      toastSuccess();
      return true;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

// --- SYSTEM TEMPLATE: PROFILE
export function addProfileOnSystemVariant(profileLink) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-templates/profiles`,
        {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(profileLink),
        },
        dispatch
      );
      if (!res.ok) {
        toastError();
        throw new Error(`Profil ekleme başarısız: ${res.status}`);
      }
      toastSuccess();
      return res.json();
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

export function editProfileOnSystemVariant(id, updated) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-templates/profiles/${id}`,
        {
          method: "PUT",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        },
        dispatch
      );
      if (!res.ok) {
        toastError();
        throw new Error(`Profil güncelleme başarısız: ${res.status}`);
      }
      toastSuccess();
      return res.json();
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

export function deleteProfileOnSystemVariant(id) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-templates/profiles/${id}`,
        { method: "DELETE", headers: { Accept: "*/*" } },
        dispatch
      );
      if (!res.ok) {
        toastError();
        throw new Error(`Profil silme başarısız: ${res.status}`);
      }
      toastSuccess();
      return true;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

// --- SYSTEM TEMPLATE: GLASS
export function addGlassOnSystemVariant(glassLink) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-templates/glasses`,
        {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(glassLink),
        },
        dispatch
      );
      if (!res.ok) {
        toastError();
        throw new Error(`Cam ekleme başarısız: ${res.status}`);
      }
      toastSuccess();
      return res.json();
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

export function editGlassOnSystemVariant(id, updated) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-templates/glasses/${id}`,
        {
          method: "PUT",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        },
        dispatch
      );
      if (!res.ok) {
        toastError();
        throw new Error(`Cam güncelleme başarısız: ${res.status}`);
      }
      toastSuccess();
      return res.json();
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

export function deleteGlassOnSystemVariant(id) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-templates/glasses/${id}`,
        { method: "DELETE", headers: { Accept: "*/*" } },
        dispatch
      );
      if (!res.ok) {
        toastError();
        throw new Error(`Cam silme başarısız: ${res.status}`);
      }
      toastSuccess();
      return true;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

// --- SYSTEM TEMPLATE: EXTRA MATERIAL
export function addEkstraMalzemeOnSystemVariant(link) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-templates/materials`,
        {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(link),
        },
        dispatch
      );
      if (!res.ok) {
        toastError();
        throw new Error(`Ekstra malzeme ekleme başarısız: ${res.status}`);
      }
      toastSuccess();
      return res.json();
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

export function editEkstraMalzemeOnSystemVariant(id, updated) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-templates/materials/${id}`,
        {
          method: "PUT",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        },
        dispatch
      );
      if (!res.ok) {
        toastError();
        throw new Error(`Ekstra malzeme güncelleme başarısız: ${res.status}`);
      }
      toastSuccess();
      return res.json();
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

export function deleteEkstraMalzemeOnSystemVariant(id) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-templates/materials/${id}`,
        { method: "DELETE", headers: { Accept: "*/*" } },
        dispatch
      );
      if (!res.ok) {
        toastError();
        throw new Error(`Ekstra malzeme silme başarısız: ${res.status}`);
      }
      toastSuccess();
      return true;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

// --- ESKİ MOCK UÇLAR (uyarlandı)
export function editSistemOnApi(sistem_id, editedRow) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/systems/${sistem_id}`,
        {
          method: "PUT",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(editedRow),
        },
        dispatch
      );
      if (!res.ok) {
        toastError();
        throw new Error(`Sistem güncelleme başarısız: ${res.status}`);
      }
      toastSuccess();
      return res.json();
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

export function addSistemToApi(sistem) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/profiles/`,
        {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(sistem),
        },
        dispatch
      );
      if (!res.ok) {
        toastError();
        throw new Error(`İstek başarısız: ${res.status}`);
      }
      toastSuccess();
      return res.json();
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

export function sellSistemOnApi(sistem_id) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/systems/${sistem_id}`,
        { method: "DELETE", headers: { Accept: "*/*" } },
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

export function sellSystemVariantOnApi(sistem_id) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-variants/${sistem_id}`,
        { method: "DELETE", headers: { Accept: "*/*" } },
        dispatch
      );
      if (!res.ok) {
        toastError();
        throw new Error(`Varyant silme başarısız: ${res.status}`);
      }
      toastSuccess();
      return true;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

/**
 * Varyantı PUBLISH et
 * PUT /api/system-variants/:variantId/publish
 */
export function publishVariant(variantId) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-variants/${variantId}/publish`,
        {
          method: "PUT",
          headers: { Accept: "application/json" },
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        toastError();
        throw new Error(`Varyant publish başarısız (HTTP ${res.status}) ${text}`);
      }

      let data = {};
      try { data = await res.json(); } catch (_) {}

      toastSuccess();
      return data;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

/**
 * Varyantı UNPUBLISH et
 * PUT /api/system-variants/:variantId/unpublish
 */
export function unpublishVariant(variantId) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-variants/${variantId}/unpublish`,
        {
          method: "PUT",
          headers: { Accept: "application/json" },
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        toastError();
        throw new Error(`Varyant unpublish başarısız (HTTP ${res.status}) ${text}`);
      }

      let data = {};
      try { data = await res.json(); } catch (_) {}

      toastSuccess();
      return data;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

/**
 * Varyantı AKTİF et
 * PUT /api/system-variants/:variantId/activate
 */
export function activateVariant(variantId) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-variants/${variantId}/activate`,
        {
          method: "PUT",
          headers: { Accept: "application/json" },
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        toastError();
        throw new Error(`Varyant activate başarısız (HTTP ${res.status}) ${text}`);
      }

      let data = {};
      try { data = await res.json(); } catch (_) {}

      toastSuccess();
      return data;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

/**
 * Varyantı PASİF et
 * PUT /api/system-variants/:variantId/deactivate
 */
export function deactivateVariant(variantId) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-variants/${variantId}/deactivate`,
        {
          method: "PUT",
          headers: { Accept: "application/json" },
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        toastError();
        throw new Error(`Varyant deactivate başarısız (HTTP ${res.status}) ${text}`);
      }

      let data = {};
      try { data = await res.json(); } catch (_) {}

      toastSuccess();
      return data;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}



export function publishSystem(systemId) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/systems/${systemId}/publish`,
        {
          method: "PUT",
          headers: { Accept: "application/json" },
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        toastError();
        throw new Error(`Varyant publish başarısız (HTTP ${res.status}) ${text}`);
      }

      let data = {};
      try { data = await res.json(); } catch (_) {}

      toastSuccess();
      return data;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}
export function unpublishSystem(systemId) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/systems/${systemId}/unpublish`,
        {
          method: "PUT",
          headers: { Accept: "application/json" },
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        toastError();
        throw new Error(`Varyant unpublish başarısız (HTTP ${res.status}) ${text}`);
      }

      let data = {};
      try { data = await res.json(); } catch (_) {}

      toastSuccess();
      return data;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

export function activateSystem(systemId) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/systems/${systemId}/activate`,
        {
          method: "PUT",
          headers: { Accept: "application/json" },
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        toastError();
        throw new Error(`Varyant activate başarısız (HTTP ${res.status}) ${text}`);
      }

      let data = {};
      try { data = await res.json(); } catch (_) {}

      toastSuccess();
      return data;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}
export function deactivateSystem(systemId) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/systems/${systemId}/deactivate`,
        {
          method: "PUT",
          headers: { Accept: "application/json" },
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        toastError();
        throw new Error(`Varyant deactivate başarısız (HTTP ${res.status}) ${text}`);
      }

      let data = {};
      try { data = await res.json(); } catch (_) {}

      toastSuccess();
      return data;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}


/**
 * SystemVariant'ın bağlı olduğu System'i değiştir
 * curl eşleniği:
 * PUT /api/system-variants/:variantId/system
 * body: { "system_id": "<uuid>" }
 *
 * @param {string} variantId  - örn: "37946015-f413-400e-86c3-4f934f974326"
 * @param {string} systemId   - örn: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 * @returns {Function} thunk
 */
export function changeSystemOfSystemVariant(variantId, systemId) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-variants/${variantId}/system`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ system_id: systemId }),
        },
        dispatch
      );

      // Başarısız ise ayrıntılı mesajla patlat
      if (!res.ok) {
        let text = "";
        try { text = await res.text(); } catch (_) {}
        toastError();
        throw new Error(`Varyantın sistemi değiştirilemedi (HTTP ${res.status}) ${text}`);
      }

      // 204 No Content ise true döndür
      if (res.status === 204) {
        toastSuccess();
        return true;
      }

      // Bazı durumlarda boş body olabilir; güvenli parse
      let data = {};
      try { data = await res.json(); } catch (_) {}

      toastSuccess();
      return data;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}