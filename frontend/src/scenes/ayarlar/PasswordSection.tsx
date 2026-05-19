// Path: @/scenes/ayarlar/PasswordSection.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import AppButton from "@/components/ui/AppButton";
import { changePassword } from "@/redux/actions/authActions";

/** Yardımcı: kural satırı (tik/nokta) */
const RuleLine = ({ ok, text }) => (
  <div className="flex items-center gap-2 text-xs">
    <span
      className={`inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px] 
      ${ok
        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
        : "border-muted-foreground/30 text-muted-foreground"}`}
      aria-hidden
    >
      {ok ? "✓" : "•"}
    </span>
    <span className={`${ok ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`}>{text}</span>
  </div>
);

/** Yardımcı: şifre gücü barı */
const StrengthBar = ({ score = 0 }) => {
  const steps = 5;
  const pct = Math.min(Math.max(score, 0), steps) / steps * 100;
  const color =
    score <= 2 ? "bg-red-500" : score === 3 ? "bg-amber-500" : score === 4 ? "bg-lime-500" : "bg-green-600";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className={`h-2 transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

export default function PasswordSection() {
  const dispatch = useDispatch();

  const [pwOld, setPwOld] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwNew2, setPwNew2] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showNew2, setShowNew2] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  const checks = useMemo(() => ({
    len: pwNew.length >= 8,
    num: /\d/.test(pwNew),
    low: /[a-z]/.test(pwNew),
    up: /[A-Z]/.test(pwNew),
    sym: /[^A-Za-z0-9]/.test(pwNew),
    match: pwNew.length > 0 && pwNew === pwNew2,
    diff: pwOld && pwNew && pwOld !== pwNew,
  }), [pwNew, pwNew2, pwOld]);

  const score = useMemo(() => {
    const base = [checks.len, checks.num, checks.low, checks.up, checks.sym].filter(Boolean).length;
    return base;
  }, [checks]);

  const allValid = checks.len && checks.num && checks.low && checks.up && checks.sym && checks.match && checks.diff;

  const validateBeforeSend = () => {
    if (!pwOld || !pwNew || !pwNew2) return "Lütfen tüm alanları doldurun.";
    if (!checks.len) return "Yeni şifre en az 8 karakter olmalı.";
    if (!checks.num) return "Yeni şifre rakam içermeli.";
    if (!checks.low) return "Yeni şifre küçük harf içermeli.";
    if (!checks.up) return "Yeni şifre büyük harf içermeli.";
    if (!checks.sym) return "Yeni şifre özel karakter içermeli.";
    if (!checks.match) return "Yeni şifre ile tekrarı eşleşmiyor.";
    if (!checks.diff) return "Yeni şifre eski şifre ile aynı olmamalı.";
    return null;
  };

  const handleChangePassword = async () => {
    setPwMsg(null);
    const err = validateBeforeSend();
    if (err) {
      setPwMsg({ type: "err", text: err });
      return;
    }
    try {
      setPwSaving(true);
      await dispatch(changePassword(pwOld, pwNew));
      setPwMsg({ type: "ok", text: "Şifreniz başarıyla değiştirildi. Güvenlik için tekrar giriş yapmanız önerilir." });
      setPwOld("");
      setPwNew("");
      setPwNew2("");
    } catch (e) {
      const msg = e?.message || e?.detail || "Şifre değiştirme başarısız.";
      setPwMsg({ type: "err", text: String(msg) });
    } finally {
      setPwSaving(false);
    }
  };

  useEffect(() => {
    const onKey = (e) => setCapsLock(e.getModifierState && e.getModifierState("CapsLock"));
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, []);

  return (
    <section className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold">Şifre Değiştir</h2>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* ... form içeriğin aynı ... */}
          {/* (Burada hiçbir davranışı değiştirmedim) */}

          {/* Eski şifre */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Eski Şifre</label>
            <div className="relative">
              <input
                type={showOld ? "text" : "password"}
                value={pwOld}
                onChange={(e) => setPwOld(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground pr-10"
                placeholder="Mevcut şifreniz"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowOld((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showOld ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                {showOld ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.88 9.88a3 3 0 104.24 4.24M10.36 5.64A9 9 0 0121 12c-1.39 3.9-5.36 7-9.99 7-1.01 0-1.98-.14-2.88-.41" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.06 12.32A10.53 10.53 0 0112 4.5c4.76 0 8.77 3.16 10.06 7.5-1.29 4.34-5.3 7.5-10.06 7.5S3.35 16.66 2.06 12.32z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Yeni şifre */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Yeni Şifre</label>
              {capsLock && (
                <span className="text-xs font-medium text-amber-600">Caps Lock açık</span>
              )}
            </div>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground pr-10"
                placeholder="Yeni şifre"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showNew ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                {showNew ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.88 9.88a3 3 0 104.24 4.24M10.36 5.64A9 9 0 0121 12c-1.39 3.9-5.36 7-9.99 7-1.01 0-1.98-.14-2.88-.41" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.06 12.32A10.53 10.53 0 0112 4.5c4.76 0 8.77 3.16 10.06 7.5-1.29 4.34-5.3 7.5-10.06 7.5S3.35 16.66 2.06 12.32z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <div className="mt-2"><StrengthBar score={score} /></div>
          </div>

          {/* Yeni şifre tekrar */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Yeni Şifre (Tekrar)</label>
            <div className="relative">
              <input
                type={showNew2 ? "text" : "password"}
                value={pwNew2}
                onChange={(e) => setPwNew2(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground pr-10"
                placeholder="Yeni şifreyi tekrar yazın"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew2((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showNew2 ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                {showNew2 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.88 9.88a3 3 0 104.24 4.24M10.36 5.64A9 9 0 0121 12c-1.39 3.9-5.36 7-9.99 7-1.01 0-1.98-.14-2.88-.41" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.06 12.32A10.53 10.53 0 0112 4.5c4.76 0 8.77 3.16 10.06 7.5-1.29 4.34-5.3 7.5-10.06 7.5S3.35 16.66 2.06 12.32z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <AppButton
              onClick={handleChangePassword}
              disabled={!allValid || pwSaving}
              loading={pwSaving}
              size="md"
              variant={allValid ? "kurumsalmavi" : "gri"}
              className="w-full"
            >
              Şifreyi Değiştir
            </AppButton>
            {pwMsg && (
              <div
                className={`text-sm ${pwMsg.type === "ok" ? "text-emerald-600" : "text-destructive"}`}
                role={pwMsg.type === "ok" ? "status" : "alert"}
              >
                {pwMsg.text}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
            İpucu: Şifrenizde en az 8 karakter, bir büyük/küçük harf, bir rakam ve bir sembol kullanmanız önerilir.
          </div>
        </div>

        <aside className="rounded-2xl border border-border bg-muted/20 p-4">
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-foreground">Şifre Gereksinimleri</h3>
          <div className="grid grid-cols-1 gap-2">
            <RuleLine ok={checks.len} text="En az 8 karakter" />
            <RuleLine ok={checks.num} text="Rakam içerir" />
            <RuleLine ok={checks.low} text="Küçük harf içerir" />
            <RuleLine ok={checks.up} text="Büyük harf içerir" />
            <RuleLine ok={checks.sym} text="Özel karakter içerir" />
            <RuleLine ok={checks.match} text="Şifreler eşleşiyor" />
            <RuleLine ok={checks.diff} text="Eski şifreden farklı" />
          </div>
        </aside>
      </div>
    </section>
  );
}
