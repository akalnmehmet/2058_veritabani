// Path: @/scenes/ayarlar/BrandSection.tsx
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import AppButton from "@/components/ui/AppButton";
import { Spinner, CellSpinner } from "./Spinner";
import { useModal } from "@/shared/modals/ModalProvider";
import {
  getPdfBrandByKey,
  updatePdfBrand,
  getBrandImage,
  putBrandImage,
  deleteBrandImage,
} from "@/redux/actions/actionsPdf";

export default function BrandSection() {
  const dispatch = useDispatch();
  const { openModal } = useModal();

  const [brandKey] = useState("brand.default0");
  const [brandDoc, setBrandDoc] = useState<any>(null);
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandSaving, setBrandSaving] = useState(false);

  const [brandImage, setBrandImage] = useState<string | null>(null);
  const [brandImageLoading, setBrandImageLoading] = useState(false);

  const loadBrandImage = async () => {
    setBrandImageLoading(true);
    try {
      const dataUrl = await getBrandImage();
      setBrandImage(dataUrl);
    } catch {
      setBrandImage(null);
    } finally {
      setBrandImageLoading(false);
    }
  };

  const openBrandLogoModal = () => {
    openModal("image.asset", {
      title: "Logo (Brand Image)",
      description: "980x300 PNG önerilir.",
      accept: "image/png",
      maxSizeMB: 10,
      recommendedText: "Önerilen: 980x300 PNG",
      submitText: "Yükle/Güncelle",
      fetchUrl: async () => {
        try {
          return await getBrandImage();
        } catch {
          return null;
        }
      },
      upload: async (file: File) => {
        await dispatch(putBrandImage(file) as any);
        await loadBrandImage();
      },
      remove: async () => {
        await dispatch(deleteBrandImage() as any);
        setBrandImage(null);
      },
    });
  };

  useEffect(() => {
    (async () => {
      try {
        setBrandLoading(true);
        const bd = await dispatch(getPdfBrandByKey(brandKey) as any);
        setBrandDoc(bd);
      } finally {
        setBrandLoading(false);
      }
    })();
  }, [brandKey, dispatch]);

  useEffect(() => {
    loadBrandImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const brandCfg = brandDoc?.config_json || {};
  const brandLines = brandCfg?.rightBox?.lines || [];

  const handleBrandChange = (path: any[], value: any) => {
    setBrandDoc((prev: any) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      let cur = next.config_json ?? (next.config_json = {});
      for (let i = 0; i < path.length - 1; i++) {
        const k = path[i];
        cur[k] = cur[k] ? { ...cur[k] } : {};
        cur = cur[k];
      }
      cur[path[path.length - 1]] = value;
      return next;
    });
  };

  const saveBrand = async () => {
    if (!brandDoc) return;
    try {
      setBrandSaving(true);
      const cfg = { ...brandDoc.config_json };
      await dispatch(updatePdfBrand({ key: brandDoc.key, config_json: cfg }) as any);
    } finally {
      setBrandSaving(false);
    }
  };

  return (
    <section className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-sm">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <h2 className="text-base sm:text-lg font-semibold">PDF Üst Başlık Değiştirme</h2>
        <AppButton
          onClick={saveBrand}
          disabled={brandLoading || !brandDoc}
          loading={brandSaving}
          size="md"
          variant="kurumsalmavi"
          className="w-full sm:w-auto"
        >
          Kaydet
        </AppButton>
      </header>

      {brandLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground">Brand Image (Logo)</label>
              <div className="border border-border rounded-xl p-2 flex items-center justify-center bg-muted/30 min-h-[130px] sm:min-h-[100px]">
                {brandImageLoading ? (
                  <CellSpinner />
                ) : (
                  <img
                    src={brandImage || "https://placehold.co/980x300/eee/ccc?text=Logo+Yok"}
                    alt="Brand Image"
                    className="max-h-28 sm:max-h-24 rounded-lg object-contain"
                    onError={(e) => (e.currentTarget.src = "https://placehold.co/980x300/eee/ccc?text=Logo+Yok")}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2">
              <AppButton
                onClick={openBrandLogoModal}
                size="md"
                variant="yesil"
                className="w-full sm:w-auto"
              >
                Logo Düzenle
              </AppButton>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Sağ Kutu Başlık</label>
            <input
              type="text"
              value={brandCfg?.rightBox?.title ?? ""}
              onChange={(e) => handleBrandChange(["rightBox", "title"], e.target.value)}
              className="border border-border rounded-xl px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground"
              placeholder="Örn: TÜMEN ALÜMİNYUM"
            />
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-medium mb-2">Sağ Kutu Satırları</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(brandLines || []).map((ln: any, idx: number) => (
                <div key={idx} className="border border-border rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex flex-col md:grid md:grid-cols-3 gap-2 md:items-center">
                    <span className="text-xs text-muted-foreground md:col-span-1">Başlık</span>
                    <input
                      className="md:col-span-2 border border-border rounded-lg px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground"
                      type="text"
                      value={ln.label ?? ""}
                      onChange={(e) => handleBrandChange(["rightBox", "lines", idx, "label"], e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col md:grid md:grid-cols-3 gap-2 md:items-center">
                    <span className="text-xs text-muted-foreground md:col-span-1">Değer</span>
                    <textarea
                      className="md:col-span-2 border border-border rounded-lg px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground"
                      rows={2}
                      value={ln.value ?? ""}
                      onChange={(e) => handleBrandChange(["rightBox", "lines", idx, "value"], e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
