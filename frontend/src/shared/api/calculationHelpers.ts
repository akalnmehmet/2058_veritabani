// Path: @/shared/api/calculationHelpers.ts

export type CalculationHelpers = {
  bicak_payi: number; // mm
  boya_payi: number;  // mm
  is_default?: boolean;
  has_record?: boolean;
};

let cache: CalculationHelpers | null = null;
let inflight: Promise<CalculationHelpers> | null = null;

function normalize(raw: any): CalculationHelpers {
  // backend bazen direkt obje, bazen {data:{...}} döndürebilir
  const src = raw?.data && typeof raw.data === "object" ? raw.data : raw;

  const bicak_payi = Number(src?.bicak_payi ?? 0);
  const boya_payi = Number(src?.boya_payi ?? 0);

  return {
    bicak_payi: Number.isFinite(bicak_payi) ? bicak_payi : 0,
    boya_payi: Number.isFinite(boya_payi) ? boya_payi : 0,
    is_default: src?.is_default === true,
    has_record: src?.has_record === true,
  };
}

/**
 * Preload YOK. Sadece çağırıldığında redux action ile backend'e gider.
 * Aynı oturumda tekrar çağrılırsa cache döner.
 *
 * Kullanım:
 *   const helpers = await getCalculationHelpersOnDemand(dispatch, getState)
 */
export async function getCalculationHelpersOnDemand(
  dispatch: any,
  getState?: () => any,
  opts?: { force?: boolean }
): Promise<CalculationHelpers> {
  if (!opts?.force && cache) return cache;
  if (inflight) return inflight;

  // actions_calc_helpers içindeki thunk'ı burada import ediyoruz.
  // (fetch bu dosyada yok; thunk kendi içinde yapar.)
  const { getCalculationHelpers } = await import("@/redux/actions/actions_calc_helpers");

  inflight = (async () => {
    try {
      // 1) thunk çalıştır
      const ret = await dispatch(getCalculationHelpers());

      // 2) önce thunk return'ünden normalize etmeyi dene
      let candidate: any = ret;

      // bazı thunk'lar { payload: ... } döndürüyor olabilir
      if (candidate?.payload != null) candidate = candidate.payload;

      // 3) eğer getState varsa, en güncel state'ten de çekmeyi dene
      if (typeof getState === "function") {
        const s = getState();
        const stData = s?.calcHelpers?.data;
        if (stData) candidate = stData;
      }

      const normalized = normalize(candidate);
      cache = normalized;
      return normalized;
    } catch (e) {
      // fallback: optimizasyon eski davranışa yakın kalsın
      const fallback: CalculationHelpers = {
        bicak_payi: 0,
        boya_payi: 0,
        is_default: true,
        has_record: false,
      };
      cache = fallback;
      return fallback;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

/** İstersen dışarıdan cache resetlemek için */
export function clearCalculationHelpersCache() {
  cache = null;
  inflight = null;
}
