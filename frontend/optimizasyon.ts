// Path: @/scenes/optimizasyon/optimizasyon.ts
import * as math from "mathjs";

/**
 * Sipariş objesindeki hesaplanan_degerler üzerinden idleri aynı olan profilleri gruplayarak kesim optimizasyonu yapar.
 * @param {Object} siparis - Sipariş objesi (siparis.urunler dizisi olmalı)
 * @param {Array} OptimizasyonSonuclar - Sonuçların doldurulacağı array (opsiyonel)
 * @returns {Array} OptimizasyonSonuclar
 */
const optimizasyonYap = (siparis, OptimizasyonSonuclar = []) => {
  if (!siparis || !Array.isArray(siparis.urunler)) {
    return OptimizasyonSonuclar;
  }

  // Tüm profilleri profil_id'ye göre grupla
  const grupMap = new Map();
  siparis.urunler.forEach((urun) => {
    const profiller = urun.hesaplananGereksinimler?.profiller || [];
    profiller.forEach((entry) => {
      const profilId = entry.profil_id;
      const profilIsim = entry.profil?.profil_isim;
      const stockLength = entry.profil?.boy_uzunluk;
      const { kesim_olcusu: cutLength, kesim_adedi: cutQty } = entry.hesaplanan_degerler || {};
      if (typeof cutLength !== 'number' || typeof cutQty !== 'number') return;

      const key = profilId;
      if (!grupMap.has(key)) {
        grupMap.set(key, { profilId, profilIsim, stockLength, pieces: [] });
      }
      const grup = grupMap.get(key);
      for (let i = 0; i < cutQty; i++) {
        grup.pieces.push(cutLength);
      }
    });
  });

  // Her bir grup için optimizasyonu çalıştır
  grupMap.forEach(({ profilId, profilIsim, stockLength, pieces }) => {
    // Büyükten küçüğe sıralayıp kopyasını al
    let remaining = pieces.slice().sort((a, b) => b - a);
    if (!remaining.length) return;

    const fireTolerance = Math.min(...remaining);

    function findBestCombination(piecesArr, stockLen, fireTol) {
      let bestCombo = [];
      let bestWaste = stockLen;

      for (let i = 0; i < piecesArr.length; i++) {
        const used = new Set([i]);
        const combo = [piecesArr[i]];
        let total = piecesArr[i];

        // >>> İLERİ STRATEJİ: "kabul edilebilir" son ara kombinasyonu izle
        let lastAcceptableCombo = combo.slice();
        let lastAcceptableWaste = stockLen - total;
        if (lastAcceptableWaste < 5) {
          lastAcceptableCombo = [];
          lastAcceptableWaste = Infinity;
        }
        // <<<

        for (let j = 0; j < piecesArr.length; j++) {
          if (used.has(j)) continue;
          if (total + piecesArr[j] <= stockLen) {
            combo.push(piecesArr[j]);
            total += piecesArr[j];
            used.add(j);

            const interimWaste = stockLen - total;
            if (interimWaste >= 5 && interimWaste < lastAcceptableWaste) {
              lastAcceptableWaste = interimWaste;
              lastAcceptableCombo = combo.slice();
            }
          }
          if (stockLen - total <= fireTol) break;
        }

        const waste = stockLen - total;

        // Nihai waste < 5 ise "bir önceki en iyi ara" kombinasyonu kabul et
        if (waste < 5 && lastAcceptableCombo.length) {
          return { combo: lastAcceptableCombo, waste: lastAcceptableWaste };
        }

        if (waste <= fireTol) {
          return { combo, waste };
        }

        if (waste < bestWaste) {
          bestWaste = waste;
          bestCombo = combo;
        }
      }

      return { combo: bestCombo, waste: bestWaste };
    }

    const stocks = [];
    while (remaining.length) {
      const { combo, waste } = findBestCombination(remaining, stockLength, fireTolerance);
      if (!combo.length) break;
      // Kullanılan parçaları remaining'den çıkar
      combo.forEach(len => {
        const idx = remaining.indexOf(len);
        if (idx >= 0) remaining.splice(idx, 1);
      });
      // Kesimler ve fire'ı nesne halinde sakla (PDF'de de işimize yarayacak)
      stocks.push({ cuts: combo.slice(), waste });
    }

    // Son boyun kesim toplamını hesapla (+50 mm eklenecek)
    const lastStock = stocks[stocks.length - 1] || { cuts: [] };
    const lastCutsSum = (lastStock.cuts || []).reduce((a, b) => a + b, 0);
    const lastCutsSumPlus50 = lastCutsSum + 50;

    // Sonuçları formate et
    const sonuc = {
      profilId,
      profilIsim,
      toplamBoySayisi: stocks.length,
      // Metin (geri uyumluluk için):
      boyKesimler: stocks.map((st, i) =>
        `Boy ${i + 1}: Kesimler -> ${st.cuts.join(", ")} | Fire: ${st.waste} mm`
      ),
      // Makine-okunur detay (PDF alt satırı için):
      boyKesimlerDetay: stocks.map(st => ({ cuts: st.cuts.slice(), waste: st.waste })),
      sonBoyToplam: lastCutsSum,
      sonBoyToplamArti50: lastCutsSumPlus50
    };

    OptimizasyonSonuclar.push(sonuc);
  });

  return OptimizasyonSonuclar;
};

export default optimizasyonYap;
