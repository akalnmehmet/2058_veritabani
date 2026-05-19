// Path: @/redux/actions/actionsPdf.ts
import * as actionTypes from "./actionTypes";
import { fetchWithAuth } from "./authFetch";
import { toastSuccess, toastError } from "../../lib/toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * PDF TITLE GÜNCELLE (PUT /me/pdf/titles/:id)
 * - Backend örneğinizdeki curl ile birebir aynı payload: { key, config_json }
 * - 401 gelirse fetchWithAuth refresh token akışını otomatik yönetir.
 */
export function updatePdfTitle(id, { key, config_json = {} }) {
  return async (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_PDF_TITLE_REQUEST });
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/me/pdf/titles/${id}`,
        {
          method: "PUT",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key, config_json }),
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        toastError();
        throw new Error(`PDF title güncellenemedi: ${res.status} ${text}`);
      }

      const data = await res.json().catch(() => ({}));
      dispatch({ type: actionTypes.UPDATE_PDF_TITLE_SUCCESS, payload: data });
      toastSuccess();
      return data;
    } catch (error) {
      dispatch({
        type: actionTypes.UPDATE_PDF_TITLE_FAILURE,
        payload: error?.message || "PDF title güncellenemedi",
      });
      toastError();
      throw error;
    }
  };
}

/**
 * KEY İLE PDF TITLE GETİR (GET /me/pdf/titles/by-key/:key)
 * - Ör: by-key/selam
 */
export function getPdfTitleByKey(key) {
  return async (dispatch) => {
    dispatch({ type: actionTypes.GET_PDF_TITLE_BY_KEY_REQUEST });
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/me/pdf/titles/by-key/${encodeURIComponent(key)}`,
        {
          method: "GET",
          headers: { accept: "application/json" },
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`PDF title alınamadı: ${res.status} ${text}`);
      }

      const data = await res.json();
      dispatch({ type: actionTypes.GET_PDF_TITLE_BY_KEY_SUCCESS, payload: data });
      return data;
    } catch (error) {
      dispatch({
        type: actionTypes.GET_PDF_TITLE_BY_KEY_FAILURE,
        payload: error?.message || "PDF title alınamadı",
      });
      throw error;
    }
  };
}

/**
 * KEY İLE PDF BRAND GETİR (GET /me/pdf/brands/by-key/:key)
 * - Ör: by-key/selam
 */
export function getPdfBrandByKey() {
  return async (dispatch) => {
    dispatch({ type: actionTypes.GET_PDF_BRAND_BY_KEY_REQUEST });
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/me/pdf/brand`,
        {
          method: "GET",
          headers: { accept: "application/json" },
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`PDF brand alınamadı: ${res.status} ${text}`);
      }

      const data = await res.json();
      dispatch({ type: actionTypes.GET_PDF_BRAND_BY_KEY_SUCCESS, payload: data });
      return data;
    } catch (error) {
      dispatch({
        type: actionTypes.GET_PDF_BRAND_BY_KEY_FAILURE,
        payload: error?.message || "PDF brand alınamadı",
      });
      throw error;
    }
  };
}

/**
 * PDF BRAND GÜNCELLE (PUT /me/pdf/brands/:id)
 * - Payload: { key, config_json }
 */
export function updatePdfBrand({ key, config_json = {} }) {
  return async (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_PDF_BRAND_REQUEST });
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/me/pdf/brand`,
        {
          method: "PUT",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key, config_json }),
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        toastError();
        throw new Error(`PDF brand güncellenemedi:  ${res.status} ${text}`);
      }

      const data = await res.json().catch(() => ({}));
      dispatch({ type: actionTypes.UPDATE_PDF_BRAND_SUCCESS, payload: data });
      toastSuccess();
      return data;
    } catch (error) {
      dispatch({
        type: actionTypes.UPDATE_PDF_BRAND_FAILURE,
        payload: error?.message || "PDF brand güncellenemedi",
      });
      toastError();
      throw error;
    }
  };
}

/**
 * PROFORMA NO (PROJECT-CODE RULE) GÜNCELLE
 * (PUT /me/project-code/rule)
 * - Payload: { prefix, separator, padding, start_number }
 * - Curl örneğinizle birebir aynı alan adları.
 */


export function updateProformaRule(payload = {}) {
  return async (dispatch) => {
    try {
      // payload içinden alanları güvenle çıkar + prefix'i backend gereksinimine göre upper-case yap
      const {
        prefix = "",
        separator = "-",
        start_number = 0,
        reset_sequence = true,
      } = payload;

      const body = {
        prefix: String(prefix || "").toUpperCase(),
        separator,
        start_number,
        reset_sequence,
      };

      const res = await fetchWithAuth(
        `${API_BASE_URL}/me/project-code/rule`,
        {
          method: "PUT",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        toastError();
        throw new Error(
          `Proforma kuralı güncellenemedi: ${res.status} ${text}`
        );
      }

      const data = await res.json().catch(() => ({}));
      toastSuccess();
      return data;
    } catch (error) {
      // Burada özel actionTypes tanımlamadığın için generic failure dispatch etmiyoruz;
      // istersen actionTypes ekleyip burada dispatch edebilirsin.
      toastError();
      throw error;
    }
  };
}

export function getProformaRule () {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/me/project-code/rule`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Proforma kuralı getirilemedi: ${res.status} ${text}`);
      }

      const data = await res.json().catch(() => ({}));
      return data;
    } catch (error) {
      throw error;
    }
  };
}


export async function getBrandImage() {
  // Not: fetchWithAuth üçüncü parametre (dispatch) olmadan da çalışabiliyorsa 'undefined' geçiyoruz.
  const res = await fetchWithAuth(
    `${API_BASE_URL}/me/pdf/brand/image/file`,
    {
      method: "GET",
      // Sunucu PNG döndürüyor; JSON beklemiyoruz.
      headers: { accept: "image/png" },
    },
    undefined
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Brand image alınamadı: ${res.status} ${text}`);
  }

  // PNG baytlarını al
  const buf = await res.arrayBuffer();
  // base64'e çevir → data URL üret
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const base64 = btoa(binary);
  const dataUrl = `data:image/png;base64,${base64}`;
  return dataUrl;
}


/**
 * PDF BRAND IMAGE YÜKLE/GÜNCELLE (PUT /me/pdf/brand/image)
 * - Payload: FormData { file: FileObject }
 * - Content-Type: multipart/form-data (fetch tarafından otomatik ayarlanır)
 */
export function putBrandImage(file) {
  return async (dispatch) => {
    // Bu action type'ları actionTypes.js dosyanıza eklemeniz gerekecek

    const formData = new FormData();
    formData.append("file", file, file.name);

    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/me/pdf/brand/image`,
        {
          method: "PUT",
          headers: {
            accept: "application/json",
            // ÖNEMLİ: 'Content-Type': 'multipart/form-data' YAZILMAMALI!
            // fetch API'si, body FormData olduğunda 'boundary' ile birlikte
            // Content-Type'ı otomatik olarak kendisi ekler. Manuel eklerseniz hata alırsınız.
          },
          body: formData,
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        toastError();
        throw new Error(`Brand image güncellenemedi: ${res.status} ${text}`);
      }

      // Curl örneğindeki accept: application/json'a göre JSON yanıt bekliyoruz.
      const data = await res.json().catch(() => ({}));
      toastSuccess();
      return data;
    } catch (error) {

      toastError();
      throw error;
    }
  };
}

/**
 * PDF BRAND IMAGE SİL (DELETE /me/pdf/brand/image)
 */
export function deleteBrandImage() {
  return async (dispatch) => {
    // Bu action type'ları actionTypes.js dosyanıza eklemeniz gerekecek

    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/me/pdf/brand/image`,
        {
          method: "DELETE",
          headers: {
            accept: "*/*", // curl örneğine göre
          },
          // Body yok
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        toastError();
        throw new Error(`Brand image silinemedi: ${res.status} ${text}`);
      }

      // DELETE işlemi başarılı olduğunda (200 OK veya 204 No Content)
      // Genellikle bir body dönmez. .json() hataya düşebilir.
      // Diğer fonksiyonlardaki gibi .catch ile güvenli hale getiriyoruz.
      const data = await res.json().catch(() => ({}));

      toastSuccess();
      return data;
    } catch (error) {
      dispatch({
        type: actionTypes.DELETE_BRAND_IMAGE_FAILURE,
        payload: error?.message || "Brand image silinemedi",
      });
      toastError();
      throw error;
    }
  };
}


/**
 * SYSTEM VARIANT PDF PHOTO YÜKLE/GÜNCELLE
 * (PUT /system-variants/:id/pdf-photo)
 * - Payload: FormData { file: FileObject }
 * - Content-Type multipart/form-data → fetch otomatik ayarlar, manuel ekleme YAPMA.
 */
export function putSystemVariantPdfPhoto(systemVariantId, file) {
  return async (dispatch) => {
    try {
      if (!systemVariantId) {
        throw new Error("systemVariantId zorunlu");
      }
      if (!file) {
        throw new Error("file zorunlu");
      }

      const formData = new FormData();
      // backend field adı: "file"
      formData.append("file", file, file.name);

      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-variants/${systemVariantId}/pdf-photo`,
        {
          method: "PUT",
          headers: {
            accept: "application/json",
            // ÖNEMLİ: Content-Type koyma!
            // FormData kullanınca boundary ile birlikte otomatik set edilir.
          },
          body: formData,
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        toastError();
        throw new Error(
          `PDF photo yüklenemedi: ${res.status} ${text}`
        );
      }

      const data = await res.json().catch(() => ({}));
      toastSuccess();
      return data;
    } catch (error) {
      toastError();
      throw error;
    }
  };
}


/**
 * SYSTEM VARIANT PDF PHOTO GETİR
 * (GET /system-variants/:id/pdf-photo)
 * - Response image/jpeg gibi binary dönüyor.
 * - Biz bunu base64 dataUrl'e çevirip return ediyoruz.
 */
export function getSystemVariantPdfPhoto(systemVariantId) {
  return async (dispatch) => {
    try {
      if (!systemVariantId) {
        throw new Error("systemVariantId zorunlu");
      }

      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-variants/${systemVariantId}/pdf-photo`,
        {
          method: "GET",
          // curl accept application/json dese de sunucu image döndürüyor.
          // O yüzden image/* daha doğru.
          headers: { accept: "image/*" },
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `PDF photo alınamadı: ${res.status} ${text}`
        );
      }

      // içerik tipini header’dan al → jpeg/png ne gelirse dataUrl doğru olsun
      const contentType =
        res.headers.get("content-type") || "image/jpeg";

      const buf = await res.arrayBuffer();
      const bytes = new Uint8Array(buf);

      // Uint8Array → binary string
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }

      // binary → base64
      const base64 = btoa(binary);

      // data url
      const dataUrl = `data:${contentType};base64,${base64}`;

      return dataUrl;
    } catch (error) {
      throw error;
    }
  };
}


/**
 * SYSTEM VARIANT PDF PHOTO SİL
 * (DELETE /system-variants/:id/pdf-photo)
 */
export function deleteSystemVariantPdfPhoto(systemVariantId) {
  return async (dispatch) => {
    try {
      if (!systemVariantId) {
        throw new Error("systemVariantId zorunlu");
      }

      const res = await fetchWithAuth(
        `${API_BASE_URL}/system-variants/${systemVariantId}/pdf-photo`,
        {
          method: "DELETE",
          headers: {
            accept: "application/json",
          },
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        toastError();
        throw new Error(
          `PDF photo silinemedi: ${res.status} ${text}`
        );
      }

      // DELETE çoğu zaman boş body döner → güvenli parse
      const data = await res.json().catch(() => ({}));
      toastSuccess();
      return data;
    } catch (error) {
      toastError();
      throw error;
    }
  };
}
