// Path: @/scenes/projeekle/pdf/registry/dataSources.ts

import { mapGlass } from '../mappers/glass.mapper';
import optimizasyonYap from '@/scenes/optimizasyon/optimizasyon';

/**
 * Yardımcı: ctx.requirements.systems → optimizasyon girişini (siparis) hazırlar.
 * Her sistemdeki profilleri, optimizasyonun beklediği forma dönüştürür.
 */
function buildSiparisFromRequirements(requirements) {
  const systems = requirements?.systems || [];
  return {
    urunler: systems.map(sys => ({
      hesaplananGereksinimler: {
        profiller: (sys.profiles || []).map(p => ({
          profil_id: p.profile_id,
          profil: p.profile, // profil objesi (ihtiyaç halinde optimizasyon için referans)
          hesaplanan_degerler: {
            kesim_olcusu: p.cut_length_mm,
            kesim_adedi: p.cut_count
          }
        }))
      }
    }))
  };
}

/**
 * Yardımcı: ProfilId → profil_kodu eşlemesi
 * (Tabloya "Profil Kodu" yazdırmak için gerekecek)
 */
function findProfilKoduById(requirements, profilId) {
  for (const sys of (requirements?.systems || [])) {
    const entry = (sys.profiles || []).find(p => p.profile_id === profilId);
    if (entry) return entry.profile?.profil_kodu || '';
  }
  return '';
}

/**
 * Yardımcı (opsiyonel): profil kesit görseli (dataURL) getirir.
 * ctx.dispatch ve ctx.getProfilImageFromApi sağlanmışsa çağrılır.
 */
async function fetchProfilImageDataUrl(ctx, profilId) {
  try {
    if (ctx?.dispatch && ctx?.getProfilImageFromApi) {
      return await ctx.dispatch(ctx.getProfilImageFromApi(profilId));
    }
  } catch (_) { /* sessiz geç */ }
  return '';
}

const dataSources = {
  /**
   * CAM TABLOSU
   * PdfEngine config'inde "dataSource": "glass" olarak kullanılır.
   * Dönen dizi autoTable body satırlarına maplenir.
   */
  glass: (ctx) => mapGlass(ctx.requirements),

  /**
   * OPTİMİZASYON (DETAYSIZ)
   * Her profil için 1 satır: profil_kodu, profil_isim, toplam_boy_sayisi, profil görüntüsü (dataURL)
   * PdfEngine config'inde "dataSource": "optimizeProfilesDetaysiz" olarak kullan.
   */
  async optimizeProfilesDetaysiz(ctx) {
    const { requirements } = ctx || {};
    // 1) optimizasyon girdisi hazırla
    const siparis = buildSiparisFromRequirements(requirements);

    // 2) optimizasyonu çalıştır
    let results = [];
    try {
      results = await optimizasyonYap(siparis);
    } catch (e) {
      console.error('[dataSources] optimizeProfilesDetaysiz optimizasyon hata:', e);
      results = [];
    }

    // 3) sonuçları tablo satırlarına dönüştür
    const out = [];
    for (const res of results) {
      const profil_kodu = findProfilKoduById(requirements, res.profilId);
      const profil_image_data_url = await fetchProfilImageDataUrl(ctx, res.profilId);

      out.push({
        profil_kodu,
        profil_isim: res.profilIsim,
        toplam_boy_sayisi: res.toplamBoySayisi,
        profil_image_data_url
      });
    }
    return out;
  },

  /**
   * OPTİMİZASYON (DETAYLI)
   * Her profil × boy kombinasyonu için 1 satır: profil_kodu, profil_isim, boy_no, kesimler, fire_mm, profil görüntüsü
   * PdfEngine config'inde "dataSource": "optimizeProfilesDetayli" olarak kullan.
   */
  async optimizeProfilesDetayli(ctx) {
    const { requirements } = ctx || {};
    // 1) optimizasyon girdisi hazırla
    const siparis = buildSiparisFromRequirements(requirements);

    // 2) optimizasyonu çalıştır
    let results = [];
    try {
      results = await optimizasyonYap(siparis);
    } catch (e) {
      console.error('[dataSources] optimizeProfilesDetayli optimizasyon hata:', e);
      results = [];
    }

    // 3) her boy kırılımı için satır üret
    const out = [];
    for (const res of results) {
      const profil_kodu = findProfilKoduById(requirements, res.profilId);
      const profil_image_data_url = await fetchProfilImageDataUrl(ctx, res.profilId);

      for (const line of (res.boyKesimler || [])) {
        // Beklenen format: "Boy X: Kesimler -> a+b+... | Fire: Y mm"
        const m = String(line).match(/Boy\s*(\d+):\s*Kesimler\s*->\s*(.*?)\s*\|\s*Fire:\s*(\d+)\s*mm/i);
        if (!m) continue;

        out.push({
          profil_kodu,
          profil_isim: res.profilIsim,
          boy_no: m[1],
          kesimler: m[2],
          fire_mm: Number(m[3]),
          profil_image_data_url
        });
      }
    }
    return out;
  }
};

export default dataSources;
