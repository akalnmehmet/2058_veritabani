// Path: @/scenes/ayarlar/OptimizationSection.tsx
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppButton from "@/components/ui/AppButton";
import {
  getCalculationHelpers,
  putCalculationHelpers,
} from "@/redux/actions/actions_calc_helpers";

export default function OptimizationSection() {
  const dispatch = useDispatch();

  // ✅ store slice adı farklı olabilir diye fallback
  const slice = useSelector((s: any) => {
    return (
      s?.calcHelpers ||
      s?.getCalculationHelpersReducer ||
      s?.calcHelpersReducer ||
      s?.calculationHelpers ||
      {}
    );
  });

  // Bazı projelerde reducer "data" yerine direkt payload’ı koyabiliyor
  const data = slice?.data ?? (slice?.bicak_payi != null ? slice : undefined);

  const loading = Boolean(slice?.loading);
  const saving = Boolean(slice?.saving);

  // ✅ number state
  const [bicak, setBicak] = useState<number>(0);
  const [boya, setBoya] = useState<number>(0);

  // ✅ 1 kere GET at
  const requestedRef = useRef(false);
  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;
    dispatch<any>(getCalculationHelpers()).catch(() => {});
  }, [dispatch]);

  // ✅ data gelince inputları 1 kere doldur (kullanıcı yazdıysa overwrite etme)
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!data) return;
    if (hydratedRef.current) return;

    setBicak(Number.isFinite(Number(data?.bicak_payi)) ? Number(data.bicak_payi) : 0);
    setBoya(Number.isFinite(Number(data?.boya_payi)) ? Number(data.boya_payi) : 0);

    hydratedRef.current = true;
  }, [data]);

  const onSave = async () => {
    await dispatch<any>(
      putCalculationHelpers({
        bicak_payi: Number.isFinite(bicak) ? bicak : 0,
        boya_payi: Number.isFinite(boya) ? boya : 0,
      })
    );
  };

  return (
    <section className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-sm text-foreground">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-lg font-semibold">Optimizasyon Parametreleri</div>
          {data?.is_default === true && (
            <div className="text-sm text-muted-foreground">
              Varsayılan değerler kullanılıyor (is_default=true)
            </div>
          )}
        </div>

        <AppButton
          onClick={onSave}
          disabled={saving || loading}
          variant="kurumsalmavi"
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </AppButton>
      </div>

      <div className="grid gap-4 max-w-md">
        <div className="grid gap-1">
          <label className="text-sm opacity-80">Bıçak Payı (mm)</label>
          <input
            type="number"
            value={bicak}
            onChange={(e) => {
              const v = e.target.value;
              setBicak(v === "" ? 0 : Number(v));
            }}
            className="w-full bg-background/50 border border-border/60 hover:border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-sm"
          />
        </div>

        <div className="grid gap-1">
          <label className="text-sm opacity-80">Boya Payı (mm)</label>
          <input
            type="number"
            value={boya}
            onChange={(e) => {
              const v = e.target.value;
              setBoya(v === "" ? 0 : Number(v));
            }}
            className="w-full bg-background/50 border border-border/60 hover:border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-sm"
          />
        </div>

        <div className="text-xs text-muted-foreground">
          Not: Bıçak payı her kesime, boya payı her stok boya uygulanır.
        </div>
      </div>
    </section>
  );
}
