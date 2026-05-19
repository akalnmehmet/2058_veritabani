// Path: @/scenes/ayarlar/RuleSection.tsx
// File: RuleSection.jsx
// ==================================
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import AppButton from "@/components/ui/AppButton";
import { getProformaRule, updateProformaRule } from "@/redux/actions/actionsPdf";

export default function RuleSection() {
  const dispatch = useDispatch();

  const [rule, setRule] = useState({
    prefix: "PRJ",
    separator: "-",
    start_number: 1,
    reset_sequence: true,
  });
  const [ruleSaving, setRuleSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await dispatch(getProformaRule());
        setRule((prev) => ({
          ...prev,
          prefix: typeof data?.prefix === "string" ? data.prefix : prev.prefix,
          separator: typeof data?.separator === "string" ? data.separator : prev.separator,
          start_number: typeof data?.start_number === "number" ? data.start_number : prev.start_number,
          reset_sequence: true,
        }));
      } catch (e) {
        console.error("Proforma kuralı getirilemedi", e);
      }
    })();
  }, [dispatch]);

  const saveRule = async () => {
    try {
      setRuleSaving(true);
      const payload = {
        prefix: (rule.prefix || "").toUpperCase().replace(/[^A-Z]/g, ""),
        separator: rule.separator ?? "",
        start_number: Number.isFinite(rule.start_number) ? rule.start_number : 0,
        reset_sequence: true,
      };
      await dispatch(updateProformaRule(payload));
    } catch (e) {
      console.error(e);
    } finally {
      setRuleSaving(false);
    }
  };

  return (
    <section className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-sm">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <h2 className="text-base sm:text-lg font-semibold">Proforma No Kuralı</h2>
        <AppButton
          onClick={saveRule}
          disabled={ruleSaving}
          loading={ruleSaving}
          size="md"
          variant="kurumsalmavi"
          className="w-full sm:w-auto"
        >
          Kaydet
        </AppButton>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Ön Ek</label>
          <input
            type="text"
            className="border border-border rounded-xl px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground"
            value={rule.prefix}
            onChange={(e) => {
              const raw = e.target.value || "";
              const cleaned = raw.toUpperCase().replace(/[^A-Z]/g, "");
              setRule((r) => ({ ...r, prefix: cleaned }));
            }}
            pattern="[A-Z]*"
            title="Sadece büyük harf kullanın (A–Z)"
            placeholder="Örn: PRJ"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Ayırıcı</label>
          <input
            type="text"
            className="border border-border rounded-xl px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground"
            value={rule.separator}
            onChange={(e) => setRule((r) => ({ ...r, separator: e.target.value }))}
            placeholder="Örn: -"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Başlangıç No</label>
          <input
            type="number"
            min={0}
            className="border border-border rounded-xl px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground"
            value={rule.start_number}
            onChange={(e) => {
              const val = e.target.value;
              setRule((r) => ({ ...r, start_number: Number(val ?? 0) }));
            }}
          />
        </div>
      </div>

      <div className="mt-3 text-sm text-foreground">
        <span className="text-muted-foreground">Örnek:</span>{" "}
        <code className="px-2 py-1 border border-border rounded-lg">
          {rule.prefix}
          {rule.separator}
          {rule.start_number}
        </code>
      </div>
    </section>
  );
}
