// Path: @/scenes/optimizasyon/optimizasyon.ts

type CalcParams = {
  bicak_payi?: number; // mm (bıçak vurma payı)
  boya_payi?: number;  // mm (minimum fire eşiği / boya payı)
};

/**
 * Sipariş objesindeki hesaplanan_degerler üzerinden idleri aynı olan profilleri gruplayarak kesim optimizasyonu yapar.
 *
 * Geriye dönük uyum:
 * - optimizasyonYap(siparis)
 * - optimizasyonYap(siparis, resultsArray)
 * - optimizasyonYap(siparis, params)
 * - optimizasyonYap(siparis, resultsArray, params)
 */
const optimizasyonYap = (siparis: any, arg2: any = undefined, arg3: any = undefined) => {
  // ---- arg parse: (resultsArray mı, params mı?) ----
  let OptimizasyonSonuclar: any[] = [];
  let params: CalcParams = {};

  if (Array.isArray(arg2)) {
    OptimizasyonSonuclar = arg2;
    params = arg3 && typeof arg3 === "object" && !Array.isArray(arg3) ? (arg3 as CalcParams) : {};
  } else if (arg2 && typeof arg2 === "object" && !Array.isArray(arg2)) {
    params = arg2 as CalcParams;
    OptimizasyonSonuclar = Array.isArray(arg3) ? arg3 : [];
  } else {
    OptimizasyonSonuclar = Array.isArray(arg3) ? arg3 : [];
    params = {};
  }

  if (!Array.isArray(OptimizasyonSonuclar)) OptimizasyonSonuclar = [];

  if (!siparis || !Array.isArray(siparis.urunler)) {
    return OptimizasyonSonuclar;
  }

  const bicak_payi = Number(params?.bicak_payi ?? 0);
  const boya_payi = Number(params?.boya_payi ?? 0);

  const bicakPayiSafe = Number.isFinite(bicak_payi) && bicak_payi > 0 ? bicak_payi : 0;
  const boyaPayiSafe = Number.isFinite(boya_payi) && boya_payi > 0 ? boya_payi : 0;

  // tüketim: sum(cuts) + bicak_payi * (kesim_sayisi - 1)
  const consumptionMm = (cuts: number[]) => {
    const sumCuts = cuts.reduce((a, b) => a + Number(b || 0), 0);
    const knifeHits = Math.max(0, cuts.length - 1);
    return sumCuts + bicakPayiSafe * knifeHits;
  };

  // ---- Tüm profilleri profil_id'ye göre grupla ----
  const grupMap = new Map<any, { profilId: any; profilIsim: any; stockLength: number; pieces: number[] }>();

  siparis.urunler.forEach((urun: any) => {
    const profiller = urun.hesaplananGereksinimler?.profiller || [];
    profiller.forEach((entry: any) => {
      const profilId = entry.profil_id;
      const profilIsim = entry.profil?.profil_isim;
      const stockLength = entry.profil?.boy_uzunluk; // mm
      const { kesim_olcusu: cutLength, kesim_adedi: cutQty } = entry.hesaplanan_degerler || {};

      if (typeof cutLength !== "number" || typeof cutQty !== "number") return;
      if (typeof stockLength !== "number" || stockLength <= 0) return;

      const key = profilId;
      if (!grupMap.has(key)) {
        grupMap.set(key, { profilId, profilIsim, stockLength, pieces: [] });
      }
      const grup = grupMap.get(key)!;

      for (let i = 0; i < cutQty; i++) {
        grup.pieces.push(cutLength);
      }
    });
  });

  // ---- Her bir grup için optimizasyon ----
  grupMap.forEach(({ profilId, profilIsim, stockLength, pieces }) => {
    let remaining = pieces.slice().sort((a, b) => b - a);
    if (!remaining.length) return;

    const fireTolerance = Math.min(...remaining);

    function findBestCombination(piecesArr: number[], stockLen: number, fireTol: number) {
      let bestCombo: number[] = [];
      let bestWaste = stockLen;

      for (let i = 0; i < piecesArr.length; i++) {
        const used = new Set<number>([i]);
        const combo: number[] = [piecesArr[i]];

        // >>> "kabul edilebilir" son ara kombinasyonu izle
        let lastAcceptableCombo = combo.slice();
        let lastAcceptableWaste = stockLen - consumptionMm(combo);

        // ❗ hardcoded 5 yok: boyaPayiSafe eşiği
        if (lastAcceptableWaste < boyaPayiSafe) {
          lastAcceptableCombo = [];
          lastAcceptableWaste = Infinity;
        }
        // <<<

        for (let j = 0; j < piecesArr.length; j++) {
          if (used.has(j)) continue;

          const trial = combo.concat([piecesArr[j]]);
          if (consumptionMm(trial) <= stockLen) {
            combo.push(piecesArr[j]);
            used.add(j);

            const interimWaste = stockLen - consumptionMm(combo);

            // ❗ hardcoded 5 yok: boyaPayiSafe eşiği
            if (interimWaste >= boyaPayiSafe && interimWaste < lastAcceptableWaste) {
              lastAcceptableWaste = interimWaste;
              lastAcceptableCombo = combo.slice();
            }
          }

          if (stockLen - consumptionMm(combo) <= fireTol) break;
        }

        const waste = stockLen - consumptionMm(combo);

        // ❗ hardcoded 5 yok: boyaPayiSafe eşiği
        // Nihai waste < boyaPayiSafe ise "bir önceki en iyi ara" kombinasyonu kabul et
        if (waste < boyaPayiSafe && lastAcceptableCombo.length) {
          return { combo: lastAcceptableCombo, waste: lastAcceptableWaste };
        }

        if (waste <= fireTol) {
          return { combo, waste };
        }

        if (waste < bestWaste) {
          bestWaste = waste;
          bestCombo = combo.slice();
        }
      }

      return { combo: bestCombo, waste: bestWaste };
    }

    const stocks: Array<{ cuts: number[]; waste: number }> = [];
    while (remaining.length) {
      const { combo, waste } = findBestCombination(remaining, stockLength, fireTolerance);
      if (!combo.length) break;

      // Kullanılan parçaları remaining'den çıkar
      combo.forEach((len) => {
        const idx = remaining.indexOf(len);
        if (idx >= 0) remaining.splice(idx, 1);
      });

      // Kesimler ve fire'ı sakla
      stocks.push({ cuts: combo.slice(), waste });
    }

    // Son boyun tüketimini hesapla (+50 mm eklenecek) — bıçak payı DAHİL
    const lastStock = stocks[stocks.length - 1] || { cuts: [] as number[] };
    const lastConsumption = consumptionMm(lastStock.cuts || []);
    const lastConsumptionPlus50 = lastConsumption + 50;

    const sonuc = {
      profilId,
      profilIsim,
      toplamBoySayisi: stocks.length,
      boyKesimler: stocks.map((st, i) => `Boy ${i + 1}: Kesimler -> ${st.cuts.join(", ")} | Fire: ${st.waste} mm`),
      boyKesimlerDetay: stocks.map((st) => ({ cuts: st.cuts.slice(), waste: st.waste })),
      sonBoyToplam: lastConsumption,
      sonBoyToplamArti50: lastConsumptionPlus50,
    };

    OptimizasyonSonuclar.push(sonuc);
  });

  return OptimizasyonSonuclar;
};

export default optimizasyonYap;
