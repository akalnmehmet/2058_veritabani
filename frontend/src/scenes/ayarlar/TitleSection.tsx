// Path: @/scenes/ayarlar/TitleSection.tsx
// File: TitleSection.jsx (aynı klasör)
// ==================================
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import AppButton from "@/components/ui/AppButton";
import { Spinner, CellSpinner } from "./Spinner";
import { getPdfTitleByKey, updatePdfTitle } from "@/redux/actions/actionsPdf";

export default function TitleSection() {
  const dispatch = useDispatch();
  const TITLE_KEYS = useMemo(
    () => [
      { key: "pdf.profileAccessory0", label: "Profil Aksesuar PDF" },
      { key: "pdf.paint0", label: "Boya Çıktısı PDF" },
      { key: "pdf.order0", label: "Üretim Çıktısı PDF" },
      { key: "pdf.glass0", label: "Cam Çıktısı PDF" },
      { key: "pdf.optimize.detayli0", label: "Detaylı Optimizasyon" },
      { key: "pdf.optimize.detaysiz0", label: "Detaysız Optimizasyon" },
    ],
    []
  );
  const [selectedTitleKey, setSelectedTitleKey] = useState(TITLE_KEYS[3].key);
  const [titleDoc, setTitleDoc] = useState(null);
  const [titleLoading, setTitleLoading] = useState(false);
  const [titleSaving, setTitleSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setTitleLoading(true);
        const td = await dispatch(getPdfTitleByKey(selectedTitleKey));
        setTitleDoc(td);
      } catch (e) {
        console.error("Title yüklenemedi", e);
      } finally {
        setTitleLoading(false);
      }
    })();
  }, [selectedTitleKey, dispatch]);

  const toggleRowEnabled = (idx, enabled) => {
    setTitleDoc((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      const rows = next.config_json?.infoRows || [];
      if (!next.config_json) next.config_json = {};
      next.config_json.infoRows = rows.map((r, i) => (i === idx ? { ...r, enabled } : r));
      return next;
    });
  };

  const saveTitle = async () => {
    if (!titleDoc) return;
    try {
      setTitleSaving(true);
      await dispatch(
        updatePdfTitle(titleDoc.id, {
          key: titleDoc.key,
          config_json: titleDoc.config_json,
        })
      );
    } catch (e) {
      console.error(e);
    } finally {
      setTitleSaving(false);
    }
  };

  return (
    <section className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-sm">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <h2 className="text-base sm:text-lg font-semibold">PDF Başlık Alanları</h2>
        <AppButton
          onClick={saveTitle}
          disabled={titleLoading || !titleDoc}
          loading={titleSaving}
          size="md"
          variant="kurumsalmavi"
          className="w-full sm:w-auto"
        >
          Kaydet
        </AppButton>
      </header>

      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
          <span className="text-sm text-muted-foreground whitespace-nowrap">PDF Türü</span>
          <select
            className="border border-border rounded-xl px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground w-full sm:w-auto"
            value={selectedTitleKey}
            onChange={(e) => setSelectedTitleKey(e.target.value)}
          >
            {TITLE_KEYS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {titleLoading && <CellSpinner />}
      </div>

      {titleLoading && !titleDoc ? (
        <Spinner />
      ) : titleDoc?.config_json?.infoRows?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {titleDoc.config_json.infoRows.map((row, idx) => (
            <label
              key={idx}
              className="border border-border rounded-2xl p-3 flex items-center justify-between gap-3"
            >
              <div className="flex-1">
                <div className="text-sm font-medium">{row.label}</div>
                <div className="text-xs text-muted-foreground">{`“${row.label}” görünsün mü?`}</div>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={!!row.enabled}
                onChange={(e) => toggleRowEnabled(idx, e.target.checked)}
              />
            </label>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Seçilen PDF için infoRows bulunamadı.</p>
      )}
    </section>
  );
}
